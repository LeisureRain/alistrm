import { Module } from '@nestjs/common';
import { AlistService } from './alist.service';
import { ConfigModule } from '@nestjs/config';
import { HttpModule } from '@nestjs/axios';
import { AlistController } from './alist.controller';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [ConfigModule, HttpModule, AuthModule],
  controllers: [AlistController],
  providers: [AlistService],
  exports: [AlistService],
})
export class AlistModule { }
