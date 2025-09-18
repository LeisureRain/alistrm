import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { HttpService } from '@nestjs/axios';

@Injectable()
export class AlistService {

    constructor(
        private configService: ConfigService,
        private httpService: HttpService
    ) { }

    async getToken(): Promise<string> {

        const ALIST_SERVER_URL = this.configService.get<string>('ALIST_SERVER_URL');
        const ALIST_USER_NAME = this.configService.get<string>('ALIST_USER_NAME');
        const ALIST_PASSWORD = this.configService.get<string>('ALIST_PASSWORD');

        const params = {
            "username": ALIST_USER_NAME,
            "password": ALIST_PASSWORD
        };

        const res = this.httpService.post(`${ALIST_SERVER_URL}/api/auth/login`, params);

        console.log('AlistService getToken response:', res);

        return "";
    }

}
