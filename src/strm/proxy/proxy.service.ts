import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { HttpService } from '@nestjs/axios';
import { AlistService } from '../../alist/alist.service';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class ProxyService {

    constructor(
        private readonly configService: ConfigService,
        private readonly httpService: HttpService,
        private readonly alistService: AlistService
    ) { }

    async get(p: string): Promise<string> {

        const data = await this.alistService.request('/api/fs/list', {
            path: '/天翼云盘'
        });

        console.log('ProxyService get data:', JSON.stringify(data));

        // const res = await this.alistService.request('/api/fs/get', {
        //     path: '/天翼云盘'
        // });

        // console.log(JSON.stringify(res));

        return "https://www.baidu.com";

        // return "https://media-tjwq-fy-person01.tj3oss.ctyunxs.cn/PERSONCLOUD/ea15510e-8429-43de-b21c-62ad3d786d23.mkv?response-content-disposition=attachment%3Bfilename%3D%22Weapons.2025.2160p.iT.WEB-DL.DD5.1.H.265.mkv%22%3Bfilename*%3DUTF-8%27%27Weapons.2025.2160p.iT.WEB-DL.DD5.1.H.265.mkv&x-amz-CLIENTNETWORK=UNKNOWN&x-amz-CLOUDTYPEIN=PERSON&x-amz-CLIENTTYPEIN=PC&Signature=Y/ixxl84V8RGp1nQLgudfoVt%2BSI%3D&AWSAccessKeyId=0Lg7dAq3ZfHvePP8DKEU&x-amz-userLevel=0&Expires=1758233005&x-amz-limitrate=51200&x-amz-FSIZE=11897328909&x-amz-UID=196038616&x-amz-UFID=823633211797154422";
    }
}
