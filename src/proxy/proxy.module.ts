import { Module } from '@nestjs/common';
import { ProxyController } from './proxy.controller';
import { ProxyService } from './proxy.service';
import { ConfigModule } from '@nestjs/config';
import { HttpModule } from '@nestjs/axios';
import { AlistModule } from '../alist/alist.module';

@Module({
  imports: [ConfigModule, HttpModule, AlistModule],
  controllers: [ProxyController],
  providers: [ProxyService],
  exports: [ProxyService]
})
export class ProxyModule { }
