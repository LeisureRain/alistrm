import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { Logger } from '@nestjs/common';
import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'path';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  // Serve static UI from /ui
  app.useStaticAssets(join(__dirname, '..', 'public', 'ui'), {
    prefix: '/ui',
  });

  await app.listen(process.env.PORT ?? 3000);
}

Logger.debug(`Alistrm version is ${process.env.VERSION ?? 'unknown'}`);
Logger.debug(`Starting server on port ${process.env.PORT ?? 3000}...`);

bootstrap();
