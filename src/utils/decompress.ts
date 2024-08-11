/* eslint-disable prettier/prettier */
import { BadRequestException } from "@nestjs/common";
import * as unzipper from 'unzipper';
import { Readable } from "stream";

export async function decompressCsv(file: Express.Multer.File): Promise<Express.Multer.File> {
    const csvFileBuffer: Express.Multer.File = await decompressZip(file);
    return csvFileBuffer;
}

async function decompressZip(file: Express.Multer.File): Promise<Express.Multer.File> {
  return new Promise((resolve, reject) => {
    unzipper.Open.buffer(file.buffer).then(async (directory) => {
      const csvFile = directory.files[0];
      if (!csvFile) {
        return reject(new BadRequestException('No CSV file found inside the zip'));
      }

      const fileBuffer = await csvFile.buffer();
      const multerFile: Express.Multer.File = {
        fieldname: file.fieldname,
        originalname: csvFile.path,
        encoding: file.encoding,
        mimetype: 'application/csv',
        size: fileBuffer.length,
        buffer: fileBuffer,
        stream: Readable.from(fileBuffer),
        destination: file.destination,
        filename: file.filename,
        path: file.path,
      };

      resolve(multerFile);
    }).catch(reject);
  });
}