import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { Logger } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  await app.listen(process.env.PORT ?? 3000);
}

Logger.debug(`Alistrm version is ${process.env.VERSION ?? 'unknown'}`);
Logger.debug(`Starting server on port ${process.env.PORT ?? 3000}...`);

bootstrap();
