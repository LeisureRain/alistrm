import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ProxyModule } from './proxy/proxy.module';
import { ScannerService } from './scanner/scanner.service';
import { ScannerModule } from './scanner/scanner.module';
import { ConfigModule } from '@nestjs/config';
import { AlistModule } from './alist/alist.module';
import configFactory from './config/config.factory';

@Module({
  controllers: [AppController],
  providers: [AppService, ScannerService],
  imports: [ProxyModule, ScannerModule, ConfigModule.forRoot({
    load: [configFactory],
    isGlobal: true,
  }), AlistModule],
})
export class AppModule { }
