/* eslint-disable prettier/prettier */
import { DynamicModule, Module, Provider } from '@nestjs/common';
import { DriveAbstractService } from './service/drive.abstract.service';

@Module({})
export class DriveModule {
    static forRoot(providers: Provider[], global = true): DynamicModule {
        return {
            global,
            module: DriveModule,
            imports: [],
            providers: [
                ...providers,
            ],
            exports: [DriveAbstractService]
        }
    }
}