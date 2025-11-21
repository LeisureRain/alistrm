import { LoggerService } from '@nestjs/common';
import { appendFileSync, existsSync, mkdirSync } from 'fs';
import { join } from 'path';

/**
 * Minimal file-based logger implementing Nest's LoggerService.
 * Writes timestamped lines to a single log file `alistrm.log` under LOG_DIR.
 */
export class FileLogger implements LoggerService {
  private logDir: string;
  private logFile: string;

  constructor(logDir?: string) {
    this.logDir = logDir || process.env.LOG_DIR || join(process.cwd(), 'logs');
    if (!existsSync(this.logDir)) {
      try {
        mkdirSync(this.logDir, { recursive: true });
      } catch (e) {
        // best-effort; if this fails, we'll fallback to console only
      }
    }
    this.logFile = join(this.logDir, 'alistrm.log');
  }

  private write(level: string, message: string) {
    try {
      const ts = this.formatTimestamp(new Date());
      appendFileSync(this.logFile, `[${ts}] [${level}] ${message}\n`, { encoding: 'utf8' });
    } catch (e) {
      // swallow write errors to avoid crashing the app; fallback to console
      // eslint-disable-next-line no-console
      console.error(`Failed to write log to ${this.logFile}:`, e);
    }
  }

  private formatTimestamp(d: Date) {
    const Y = d.getFullYear();
    const M = String(d.getMonth() + 1).padStart(2, '0');
    const D = String(d.getDate()).padStart(2, '0');
    const h = String(d.getHours()).padStart(2, '0');
    const m = String(d.getMinutes()).padStart(2, '0');
    const s = String(d.getSeconds()).padStart(2, '0');
    return `${Y}-${M}-${D} ${h}:${m}:${s}`;
  }

  log(message: any, ...optionalParams: any[]) {
    this.write('LOG', this.format(message, optionalParams));
  }
  error(message: any, ...optionalParams: any[]) {
    this.write('ERROR', this.format(message, optionalParams));
  }
  warn(message: any, ...optionalParams: any[]) {
    this.write('WARN', this.format(message, optionalParams));
  }
  debug(message: any, ...optionalParams: any[]) {
    this.write('DEBUG', this.format(message, optionalParams));
  }
  verbose(message: any, ...optionalParams: any[]) {
    this.write('VERBOSE', this.format(message, optionalParams));
  }

  private format(msg: any, params: any[]) {
    try {
      if (typeof msg === 'string') {
        if (params && params.length) return msg + ' ' + params.map(p => (typeof p === 'string' ? p : JSON.stringify(p))).join(' ');
        return msg;
      }
      return JSON.stringify(msg);
    } catch (e) {
      return String(msg);
    }
  }
}
