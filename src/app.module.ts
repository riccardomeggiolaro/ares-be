/* eslint-disable prettier/prettier */
import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule } from '@nestjs/config';
import { DriveApiModule } from './api/drive/drive.module';
import { DriveModule } from './modules/drive/drive.module';
import { DriveAbstractService } from './modules/drive/service/drive.abstract.service';
import { GoogleDriveService } from './modules/drive/service/google-drive.service';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    DriveModule.forRoot([
      { provide: DriveAbstractService, useClass: GoogleDriveService }
    ]),
    DriveApiModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}