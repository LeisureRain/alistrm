import { Module } from '@nestjs/common';
import { AlistService } from './alist.service';
import { ConfigModule } from '@nestjs/config';
import { HttpModule } from '@nestjs/axios';
import { AlistController } from './alist.controller';

@Module({
  imports: [ConfigModule, HttpModule],
  controllers: [AlistController],
  providers: [AlistService],
  exports: [AlistService],
})
export class AlistModule { }
