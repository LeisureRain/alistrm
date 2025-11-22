import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'path';
import { FileLogger } from './logger/file-logger.service';

// instantiate file logger early so we can log startup messages to file as well
const fileLogger = new FileLogger(process.env.LOG_DIR || undefined);

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  // switch Nest to use our file logger
  app.useLogger(fileLogger as any);

  // Serve static UI from /ui
  // Serve static UI assets under /ui but do NOT auto-serve index.html for the directory
  // so we can perform a server-side auth check and return either the login or index page
  app.useStaticAssets(join(__dirname, '..', 'public', 'ui'), {
    prefix: '/ui',
    index: false,
  });

  await app.listen(process.env.PORT ?? 3000);
}

fileLogger.debug(`Alistrm version is ${process.env.VERSION ?? 'unknown'}`);
fileLogger.debug(`Starting server on port ${process.env.PORT ?? 3000}...`);

bootstrap();
