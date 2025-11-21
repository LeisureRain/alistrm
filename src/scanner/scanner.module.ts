import { Module } from '@nestjs/common';
import { ScannerController } from './scanner.controller';
import { ConfigModule } from '@nestjs/config';
import { HttpModule } from '@nestjs/axios';
import { AlistModule } from '../alist/alist.module';
import { ProxyModule } from '../proxy/proxy.module';
import { ScannerService } from './scanner.service';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [ConfigModule, HttpModule, AlistModule, ProxyModule, AuthModule],
  controllers: [ScannerController],
  providers: [ScannerService]
})
export class ScannerModule { }
