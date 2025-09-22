import { Controller, Get, Query, Redirect } from '@nestjs/common';
import { ProxyService } from './proxy.service';

@Controller('proxy')
export class ProxyController {

    constructor(private readonly proxyService: ProxyService) { }

    @Get()
    @Redirect()
    async handleRedirect(@Query('p') p: string): Promise<{ url: string }> {
        return {
            url: await this.proxyService.handleRedirect(p)
        }
    }

}
