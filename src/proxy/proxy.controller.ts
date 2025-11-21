import { Controller, Get, Query, Redirect, Res, UseGuards } from '@nestjs/common';
import { ProxyService } from './proxy.service';
import { AuthGuard } from '../auth/auth.guard';

@Controller('proxy')
@UseGuards(AuthGuard)
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
