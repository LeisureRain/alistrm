import { Controller, Get, Query, Redirect, Res } from '@nestjs/common';
import { ProxyService } from './proxy.service';

@Controller('proxy')
export class ProxyController {

    constructor(private readonly proxyService: ProxyService) { }

    @Get()
    async handleRedirect(@Query('p') p: string, @Res() res): Promise<void> {
        try {
            const targetUrl = await this.proxyService.getRedirectUrl(p);
            res.status(302)
                .setHeader('Location', targetUrl)
                .setHeader('Content-Length', '0');
            res.removeHeader('Content-Type');
            res.end();
        } catch (error) {
            res.status(500).end();
        }

    }
}
