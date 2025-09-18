import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { HttpService } from '@nestjs/axios';

@Injectable()
export class ProxyService {

    constructor(
        private configService: ConfigService,
        private httpService: HttpService
    ) { }

    async get(p: string): Promise<string> {
        console.log('ProxyService get path:', p);

        const api = "/api/fs/list";

        const ALIST_SERVER_URL = this.configService.get<string>('ALIST_SERVER_URL');
        const ALIST_USER_NAME = this.configService.get<string>('ALIST_USER_NAME');
        const ALIST_PASSWORD = this.configService.get<string>('ALIST_PASSWORD');

        const url = `${ALIST_SERVER_URL}${api}?path=${encodeURIComponent(p)}`;

        // this.httpService

        return "https://www.baidu.com";

        // return "https://media-tjwq-fy-person01.tj3oss.ctyunxs.cn/PERSONCLOUD/ea15510e-8429-43de-b21c-62ad3d786d23.mkv?response-content-disposition=attachment%3Bfilename%3D%22Weapons.2025.2160p.iT.WEB-DL.DD5.1.H.265.mkv%22%3Bfilename*%3DUTF-8%27%27Weapons.2025.2160p.iT.WEB-DL.DD5.1.H.265.mkv&x-amz-CLIENTNETWORK=UNKNOWN&x-amz-CLOUDTYPEIN=PERSON&x-amz-CLIENTTYPEIN=PC&Signature=Y/ixxl84V8RGp1nQLgudfoVt%2BSI%3D&AWSAccessKeyId=0Lg7dAq3ZfHvePP8DKEU&x-amz-userLevel=0&Expires=1758233005&x-amz-limitrate=51200&x-amz-FSIZE=11897328909&x-amz-UID=196038616&x-amz-UFID=823633211797154422";
    }
}
