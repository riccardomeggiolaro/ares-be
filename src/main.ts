/* eslint-disable prettier/prettier */
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { useContainer } from 'class-validator';
import helmet from 'helmet';
import * as compression from 'compression';

async function bootstrap() {

  
  const app = await NestFactory.create(AppModule);
  app.use(helmet());
  app.use(compression());
  app.setGlobalPrefix('api');
  useContainer(app.select(AppModule), { fallbackOnErrors: true });
  app.enableCors();
  await app.listen(process.env.PORT || 3000);
}
bootstrap();