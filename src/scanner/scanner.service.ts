import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AlistService } from '../alist/alist.service';
import { ProxyService } from '../proxy/proxy.service';
import { join } from 'path';
import { writeFileSync, existsSync, mkdirSync, readFileSync } from 'fs';
import { isVideoFile } from '../util/util';

@Injectable()
export class ScannerService {

    constructor(
        private readonly configService: ConfigService,
        private readonly alistService: AlistService,
        private readonly proxyService: ProxyService
    ) { }

    private status = {
        running: false,
        totalVisited: 0,
        filesFound: 0,
        strmCreated: 0,
        currentPath: '',
        startedAt: 0,
        finishedAt: 0,
        error: ''
    };

    private currentSession: any = null;
    private historyFilePath = require('path').join(process.cwd(), 'data', 'scan-history.json');

    private ensureHistoryDir() {
        const dir = require('path').dirname(this.historyFilePath);
        if (!existsSync(dir)) {
            mkdirSync(dir, { recursive: true });
        }
        if (!existsSync(this.historyFilePath)) {
            writeFileSync(this.historyFilePath, JSON.stringify([]), { encoding: 'utf8' });
        }
    }

    private loadHistory(): any[] {
        try {
            this.ensureHistoryDir();
            const raw = readFileSync(this.historyFilePath, { encoding: 'utf8' });
            return JSON.parse(raw || '[]');
        } catch (err) {
            Logger.error('Failed to read scan history: ' + err);
            return [];
        }
    }

    private appendHistory(session: any) {
        try {
            const arr = this.loadHistory();
            arr.push(session);
            writeFileSync(this.historyFilePath, JSON.stringify(arr, null, 2), { encoding: 'utf8' });
        } catch (err) {
            Logger.error('Failed to save scan history: ' + err);
        }
    }

    getHistory(): any[] {
        return this.loadHistory();
    }

    getLatestHistory(): any | null {
        const arr = this.loadHistory();
        return arr.length ? arr[arr.length - 1] : null;
    }

    getStatus() {
        const now = Date.now();
        return {
            running: this.status.running,
            totalVisited: this.status.totalVisited,
            filesFound: this.status.filesFound,
            strmCreated: this.status.strmCreated,
            currentPath: this.status.currentPath,
            startedAt: this.status.startedAt,
            finishedAt: this.status.finishedAt,
            error: this.status.error,
            elapsedMs: this.status.running ? (now - this.status.startedAt) : (this.status.startedAt ? (this.status.finishedAt - this.status.startedAt) : 0)
        };
    }

    rescan() {

        Logger.debug('start to rescan');

        // initialize status
        this.status.running = true;
        this.status.totalVisited = 0;
        this.status.filesFound = 0;
        this.status.currentPath = '';
        this.status.startedAt = Date.now();
        this.status.finishedAt = 0;
        this.status.error = '';

        // create a new session object to record this scan
        this.currentSession = {
            id: `scan-${Date.now()}`,
            startedAt: this.status.startedAt,
            finishedAt: 0,
            totalVisited: 0,
            filesFound: 0,
            strmCreated: 0,
            createdFiles: [],
            error: ''
        };

        // kick off async scan (don't await)
        this.doScan({
            folder: this.configService.get<string>("SCAN_BASE_PATH") || '/'
        }).then(() => {
            this.status.running = false;
            this.status.finishedAt = Date.now();
            this.currentSession.finishedAt = this.status.finishedAt;
            this.currentSession.totalVisited = this.status.totalVisited;
            this.currentSession.filesFound = this.status.filesFound;
            this.currentSession.strmCreated = this.status.strmCreated;
            // persist session to history file
            this.appendHistory(this.currentSession);
            this.currentSession = null;
            Logger.debug('rescan finished');
        }).catch(err => {
            this.status.running = false;
            this.status.finishedAt = Date.now();
            this.status.error = err?.message || String(err);
            if (this.currentSession) {
                this.currentSession.finishedAt = this.status.finishedAt;
                this.currentSession.error = this.status.error;
                this.appendHistory(this.currentSession);
                this.currentSession = null;
            }
            Logger.error('rescan error: ' + err);
        });
    }

    async doScan({ folder }: { folder: string }) {
        Logger.debug(`Scanning folder ${folder}`);

        this.status.currentPath = folder;

        const data = await this.alistService.request('/api/fs/list', {
            path: folder
        });

        const serverAddress = this.configService.get<string>("ALISTRM_SERVER_URL_TO_EMBY");

        if (data.content && data.content.length > 0) {
            for (const item of data.content) {
                if (item.is_dir) {
                    Logger.debug(`Found subfolder: ${item.name}`);
                    this.status.totalVisited++;
                    // Recursively scan the subfolder
                    await this.doScan({
                        folder: join(folder, item.name),
                    });
                } else {

                    // only process video files
                    if (!isVideoFile(item.name)) {
                        Logger.debug(`Skipping non-video file: ${item.name}`);
                        // still count as visited
                        this.status.totalVisited++;
                        continue;
                    }

                    Logger.debug(`Found video file: ${item.name}`);

                    this.status.totalVisited++;
                    this.status.filesFound++;

                    const basePath = this.configService.get<string>("STRM_BASE_PATH");
                    if (!basePath) {
                        throw new Error("STRM_BASE_PATH is not configured");
                    }

                    if (!existsSync(basePath)) {
                        mkdirSync(basePath, { recursive: true });
                    }

                    mkdirSync(join(basePath, folder), { recursive: true });

                    const strmFilePath = join(basePath, folder, item.name.substring(0, item.name.lastIndexOf('.')) + ".strm");

                    // obtain redirect/raw URL from ProxyService instead of composing manually
                    try {
                        const redirectUrl = await this.proxyService.getRedirectUrl(join(folder, item.name));
                        const strmFileContent = redirectUrl;

                        // create strm file and write content
                        Logger.debug(`Creating strm file: ${strmFilePath}`);
                        writeFileSync(strmFilePath, strmFileContent);
                        // increment created counter
                        this.status.strmCreated = (this.status.strmCreated || 0) + 1;
                        // record created file in current session if present
                        if (this.currentSession) {
                            this.currentSession.createdFiles.push(strmFilePath);
                        }
                    } catch (err) {
                        Logger.error(`Failed to get redirect URL for ${join(folder, item.name)}: ${err}`);
                    }
                }
            }
        }
    }
}