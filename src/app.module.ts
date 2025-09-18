import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ProxyModule } from './strm/proxy/proxy.module';
import { ScannerService } from './strm/scanner/scanner.service';
import { ScannerModule } from './strm/scanner/scanner.module';
import { ConfigModule } from '@nestjs/config';
import { AlistModule } from './alist/alist.module';

@Module({
  controllers: [AppController],
  providers: [AppService, ScannerService],
  imports: [ProxyModule, ScannerModule, ConfigModule.forRoot({
    isGlobal: true,
  }), AlistModule],
})
export class AppModule { }
