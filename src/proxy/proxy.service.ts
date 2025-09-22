import { Injectable, Logger, HttpException, HttpStatus } from '@nestjs/common';
import { AlistService } from '../alist/alist.service';

@Injectable()
export class ProxyService {

    constructor(
        private readonly alistService: AlistService
    ) { }

    async getRedirectUrl(p: string): Promise<string> {

        const data = await this.alistService.request('/api/fs/get', {
            path: p
        });

        if (data && data.id) {

            Logger.debug(`success get raw_url: ${p} -> ${data.raw_url}`);

            return data.raw_url;
        }

        throw new HttpException("File not found", HttpStatus.NOT_FOUND);
    }
}
