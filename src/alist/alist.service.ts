import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { HttpService } from '@nestjs/axios';
import * as tokenStore from './tokenStore';
import { firstValueFrom } from 'rxjs';
import { HttpException, HttpStatus } from "@nestjs/common";

@Injectable()
export class AlistService {

    public static readonly ALIST_ERROR_CODE_INVALID_TOKEN = 401;
    public static readonly ALIST_SUCCESS_CODE = 200;

    constructor(
        private configService: ConfigService,
        private httpService: HttpService
    ) { }

    private async getToken(): Promise<string> {

        let token = tokenStore.get();

        if (token && token.length > 0) {
            return token;
        }

        const ALIST_SERVER_URL = this.configService.get<string>('ALIST_SERVER_URL');
        const ALIST_USER_NAME = this.configService.get<string>('ALIST_USER_NAME');
        const ALIST_PASSWORD = this.configService.get<string>('ALIST_PASSWORD');

        const params = {
            "username": ALIST_USER_NAME,
            "password": ALIST_PASSWORD
        };

        try {

            const res = await firstValueFrom(this.httpService.post(`${ALIST_SERVER_URL}/api/auth/login`, params));

            if (res.data && res.data.code == AlistService.ALIST_SUCCESS_CODE) {
                token = res.data.data.token;
                tokenStore.set(token);
                return token;
            } else {
                throw new HttpException('Failed to get token from Alist:' + JSON.stringify(res), HttpStatus.OK);
            }
        } catch (error) {
            throw error;
        }
    }

    async request(api: string, params: any): Promise<any> {
        return this.requestInternal(api, params, false);
    }

    private async requestInternal(api: string, params: any, isRetry: boolean): Promise<any> {
        const ALIST_SERVER_URL = this.configService.get<string>('ALIST_SERVER_URL');
        const token = await this.getToken();
        const headers = {
            Authorization: token
        };

        try {

            const res = await firstValueFrom(this.httpService.post(`${ALIST_SERVER_URL}${api}`, params, { headers }));

            if (res.data) {
                if (res.data.code === AlistService.ALIST_ERROR_CODE_INVALID_TOKEN) {
                    if (isRetry) {
                        throw new HttpException('Invalid token, even after retrying.', HttpStatus.OK);
                    }
                    tokenStore.clear();
                    await this.getToken(); // refresh token
                    return await this.requestInternal(api, params, true); // retry
                } else if (res.data.code == 200) {
                    return res.data.data;
                } else {
                    throw new HttpException('API request failed: ' + JSON.stringify(res.data), HttpStatus.OK);
                }
            }

            return res.data;
        } catch (error) {
            throw error;
        }

    }

}
