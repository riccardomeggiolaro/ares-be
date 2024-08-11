/* eslint-disable prettier/prettier */
import { Module } from '@nestjs/common';
import { DriveController } from './drive.controller';

@Module({
  imports: [
  ],
  controllers: [DriveController],
  providers: [],
})
export class DriveApiModule {}