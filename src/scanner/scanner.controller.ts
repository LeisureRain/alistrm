import { Controller, Get, Put, Request, UseGuards } from '@nestjs/common';
import { ScannerService } from './scanner.service';
import { Request as ExpressRequest } from 'express';
import { AuthGuard } from '../auth/auth.guard';

@Controller('scanner')
@UseGuards(AuthGuard)
export class ScannerController {

    constructor(private readonly scannerService: ScannerService) { }

    @Get('rescan')
    rescan(): string {

        this.scannerService.rescan();

        return 'ok';
    }

    @Get('status')
    status() {
        return this.scannerService.getStatus();
    }
    
    @Get('history')
    history() {
        return this.scannerService.getHistory();
    }

    @Get('history/latest')
    latest() {
        return this.scannerService.getLatestHistory();
    }
}
