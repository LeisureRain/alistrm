import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AlistService } from '../alist/alist.service';
import { join } from 'path';
import { writeFileSync, existsSync, mkdirSync } from 'fs';
import { isVideoFile } from '../util/util';

@Injectable()
export class ScannerService {

    constructor(
        private readonly configService: ConfigService,
        private readonly alistService: AlistService
    ) { }

    rescan() {

        Logger.debug('start to rescan');


        this.doScan({
            folder: this.configService.get<string>("SCAN_BASE_PATH") || '/'
        });
    }

    async doScan({ folder }: { folder: string }) {
        Logger.debug(`Scanning folder ${folder}`);

        const data = await this.alistService.request('/api/fs/list', {
            path: folder
        });

        const serverAddress = this.configService.get<string>("ALISTRM_SERVER_URL_TO_EMBY");

        if (data.content && data.content.length > 0) {
            for (const item of data.content) {
                if (item.is_dir) {
                    Logger.debug(`Found subfolder: ${item.name}`);
                    // Recursively scan the subfolder
                    await this.doScan({
                        folder: join(folder, item.name),
                    });
                } else {

                    Logger.debug(`Found video file: ${item.name}`);

                    const basePath = this.configService.get<string>("STRM_BASE_PATH");
                    if (!basePath) {
                        throw new Error("STRM_BASE_PATH is not configured");
                    }

                    if (!existsSync(basePath)) {
                        mkdirSync(basePath, { recursive: true });
                    }

                    mkdirSync(join(basePath, folder), { recursive: true });

                    const strmFilePath = join(basePath, folder, item.name.substring(0, item.name.lastIndexOf('.')) + ".strm");

                    const strmFileContent = `${serverAddress}/proxy?p=${encodeURIComponent(join(folder, item.name))}`;

                    // create strm file and write content
                    Logger.debug(`Creating strm file: ${strmFilePath}`);
                    writeFileSync(strmFilePath, strmFileContent);
                }
            }
        }
    }
}