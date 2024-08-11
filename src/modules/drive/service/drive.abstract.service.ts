/* eslint-disable prettier/prettier */
import { Injectable } from '@nestjs/common';
import { Observable } from 'rxjs';

@Injectable()
export abstract class DriveAbstractService {
    abstract upload(file: Express.Multer.File): Promise<Observable<number>>;
    abstract findFile(fileName: string): Promise<string>;
    abstract existFile(fileName: string): Promise<boolean>;
}