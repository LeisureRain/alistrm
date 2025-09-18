import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { HttpService } from '@nestjs/axios';
import { AlistService } from '../alist/alist.service';

@Injectable()
export class ProxyService {

    constructor(
        private readonly configService: ConfigService,
        private readonly httpService: HttpService,
        private readonly alistService: AlistService
    ) { }

    async get(p: string): Promise<string> {

        const data = await this.alistService.request('/api/fs/get', {
            path: p
        });

        if (data) {
            return data.raw_url;
        }

        throw new Error("File not found");
    }
}
