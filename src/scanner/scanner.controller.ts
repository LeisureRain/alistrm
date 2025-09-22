import { Controller, Get, Put, Request } from '@nestjs/common';
import { ScannerService } from './scanner.service';
import { Request as ExpressRequest } from 'express';

@Controller('scanner')
export class ScannerController {

    constructor(private readonly scannerService: ScannerService) { }

    @Get('rescan')
    rescan(@Request() req: ExpressRequest) : string{

        const protocol = req.protocol;

        const host = req.get('host');

        const serverAddress = `${protocol}://${host}`;

        this.scannerService.rescan({
            serverAddress
        });

        return 'ok';
    }
}
