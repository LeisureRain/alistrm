import { Controller, Get, HttpRedirectResponse, Query, Redirect, Res } from '@nestjs/common';
import { ProxyService } from './proxy.service';
import { Response } from 'express';

@Controller('proxy')
export class ProxyController {

    constructor(private readonly proxyService: ProxyService) { }

    @Get()
    async get(@Query('p') p: string, @Res() res: Response) {

        const url = await this.proxyService.get(p);

        res.setHeader('Location', url);
        res.status(302).send();
    }

}
