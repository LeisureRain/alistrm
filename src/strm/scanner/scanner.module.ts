import { Module } from '@nestjs/common';
import { ScannerController } from './scanner.controller';

@Module({
  controllers: [ScannerController]
})
export class ScannerModule {}
