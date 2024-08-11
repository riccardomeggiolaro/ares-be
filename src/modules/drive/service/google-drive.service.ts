/* eslint-disable prettier/prettier */
import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { google } from 'googleapis';
import { GoogleServiceAccount } from '../interface/google.interface';
import { DriveAbstractService } from './drive.abstract.service';
import { Readable } from 'stream';
import { Observable } from 'rxjs';

@Injectable()
export class GoogleDriveService extends DriveAbstractService {
    private readonly FOLDER_ID: string;
    private readonly SCOPE: string[];
    private readonly API_KEYS: GoogleServiceAccount;

    constructor(private readonly configService: ConfigService) {
        super();
        this.FOLDER_ID = this.configService.get<string>('FOLDER_ID');
        this.SCOPE = [this.configService.get<string>('SCOPE')];
        this.API_KEYS = JSON.parse(this.configService.get<string>('API_KEYS'))
    }

    private async authorize(): Promise<any> {
        const authClient = new google.auth.JWT(
            this.API_KEYS.client_email,
            null,
            this.API_KEYS.private_key,
            this.SCOPE
        );
        await authClient.authorize();
        const drive = google.drive({ version: 'v3', auth: authClient });
        return drive;
    }

    private async find(drive: any, fileName: string): Promise<string | null> {
        try {
            const response = await drive.files.list({
                q: `name='${fileName}' and '${this.FOLDER_ID}' in parents and trashed=false`,
                fields: 'files(id, name)',
                spaces: 'drive'
            });

            if (response.data.files.length > 0) {
                return response.data.files[0].id;
            } else {
                return null;
            }
        } catch (error) {
            throw new BadRequestException(`Failed to search for file in Google Drive: ${error.message}`);
        }
    }
    
    private calculateChunkSize(fileSize: number): number {
        const constant = 10 * 1024 * 1024; // 5 MB as base for the constant
        if (fileSize <= 10 * 1024 * 1024) { // If the file size is <= 5 MB
            return fileSize; // Load the entire file in one chunk since it's <= 5 MB
        }
        return Math.floor(constant / Math.log(fileSize));
    }    

    async upload(file: Express.Multer.File): Promise<Observable<number>> {
        return new Observable<number>((observer) => {
            this.authorize().then(drive => {
                const fileSize = file.size;
    
                console.log('Starting chunked upload process...');
                console.log(`File size: ${fileSize} bytes`);
    
                const chunkSize = this.calculateChunkSize(fileSize);
                let start = 0;
                let uploadedBytes = 0;
    
                // Inizia la sessione di upload
                drive.files.create({
                    requestBody: {
                        name: file.originalname,
                        parents: [this.FOLDER_ID],
                    },
                    media: {
                        mimeType: file.mimetype,
                    },
                    fields: 'id',
                }).then(res => {
                    const fileId = res.data.id;
    
                    const uploadChunk = () => {
                        if (start < fileSize) {
                            const end = Math.min(start + chunkSize, fileSize);
                            const chunk = file.buffer.slice(start, end);
                            const chunkStream = new Readable();
                            chunkStream.push(chunk);
                            chunkStream.push(null);
    
                            drive.files.update({
                                fileId: fileId,
                                media: {
                                    body: chunkStream,
                                },
                                addParents: this.FOLDER_ID,
                            }, {
                                headers: {
                                    'Content-Range': `bytes ${start}-${end - 1}/${fileSize}`,
                                },
                            }).then(() => {
                                uploadedBytes += (end - start);
                                const progress = (uploadedBytes / fileSize) * 100;
                                console.log(`Upload progress: ${progress.toFixed(2)}%`);
    
                                // Emitti la percentuale di progresso
                                observer.next(progress);
    
                                start = end;
                                uploadChunk();
                            }).catch(error => {
                                console.error('Upload error:', error);
                                if (error.response) {
                                    console.error('Error response:', error.response.data);
                                }
                                observer.error(error);
                            });
                        } else {
                            console.log('File uploaded successfully. File ID:', fileId);
                            observer.complete();
                        }
                    };
    
                    uploadChunk();
                }).catch(error => {
                    console.error('Error during file creation:', error);
                    observer.error(error);
                });
            }).catch(error => {
                console.error('Authorization error:', error);
                observer.error(error);
            });
        });
    }
    

    async findFile(fileName: string): Promise<string> {
        const drive = await this.authorize();
        const file = await this.find(drive, fileName);
        if (!file) throw new NotFoundException();
        return file;
    }

    async existFile(fileName: string): Promise<boolean> {
        const drive = await this.authorize();
        const file = await this.find(drive, fileName);
        return file ? true : false;
    }
}