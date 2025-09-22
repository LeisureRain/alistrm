import { Controller, Get, Put, Request } from '@nestjs/common';
import { ScannerService } from './scanner.service';
import { Request as ExpressRequest } from 'express';

@Controller('scanner')
export class ScannerController {

    constructor(private readonly scannerService: ScannerService) { }

    @Get('rescan')
    rescan(): string {

        this.scannerService.rescan();

        return 'ok';
    }
}
