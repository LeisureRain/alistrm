import { Module } from '@nestjs/common';
import { AlistService } from './alist.service';
import { ConfigModule } from '@nestjs/config';
import { HttpModule } from '@nestjs/axios';

@Module({
  imports: [ConfigModule, HttpModule],
  providers: [AlistService]
})
export class AlistModule { }
