import { Injectable, Logger } from '@nestjs/common';
import { randomBytes, scryptSync } from 'crypto';
import { join } from 'path';
import { existsSync, readFileSync, writeFileSync, mkdirSync } from 'fs';

interface StoredUser {
  username: string;
  salt: string;
  hash: string;
}

interface AuthFile {
  user: StoredUser | null;
  sessions: { [sid: string]: { username: string; createdAt: number } };
}

@Injectable()
export class AuthService {
  private filePath = join(process.cwd(), 'data', 'auth.json');
  private lock = false; // naive lock for writes
  // session TTL in seconds (default 24h)
  private sessionTtl = Number(process.env.SESSION_TTL_SECONDS || 86400);
  private cleanupIntervalMs = 1000 * 60 * 10; // default 10 minutes
  private cleanupTimer: NodeJS.Timeout | null = null;

  constructor() {
    this.ensureFile();
    // start periodic cleanup
    try {
      this.cleanupTimer = setInterval(() => {
        try {
          this.cleanupExpiredSessions();
        } catch (e) {
          Logger.debug('session cleanup error: ' + e);
        }
      }, this.cleanupIntervalMs);
    } catch (e) {
      Logger.debug('Failed to start session cleanup timer: ' + e);
    }
  }

  private ensureFile() {
    const dir = join(process.cwd(), 'data');
    try {
      if (!existsSync(dir)) mkdirSync(dir, { recursive: true });
      if (!existsSync(this.filePath)) {
        const username = process.env.ADMIN_USER || 'admin';
        const password = process.env.ADMIN_PASS || 'admin';
        const salt = randomBytes(16).toString('hex');
        const hash = scryptSync(password, salt, 64).toString('hex');
        const initial: AuthFile = { user: { username, salt, hash }, sessions: {} };
        writeFileSync(this.filePath, JSON.stringify(initial, null, 2), { encoding: 'utf8' });
      }
    } catch (e) {
      Logger.error('Failed to ensure auth file: ' + e);
    }
  }

  private readFile(): AuthFile {
    try {
      const raw = readFileSync(this.filePath, { encoding: 'utf8' });
      const parsed = JSON.parse(raw || '{}');
      // Migration: older versions stored the user object at top-level { username, salt, hash }
      // Convert to the new shape { user: {...}, sessions: {} }
      if (parsed && parsed.username && parsed.salt && parsed.hash && !parsed.user) {
        const migrated: AuthFile = { user: { username: parsed.username, salt: parsed.salt, hash: parsed.hash }, sessions: {} };
        // persist migrated shape
        try {
          writeFileSync(this.filePath, JSON.stringify(migrated, null, 2), { encoding: 'utf8' });
        } catch (e) {
          Logger.debug('Failed to write migrated auth file: ' + e);
        }
        return migrated;
      }
      return parsed as AuthFile;
    } catch (e) {
      Logger.error('Failed to read auth file: ' + e);
      return { user: null, sessions: {} };
    }
  }

  private writeFile(data: AuthFile) {
    // naive write with retry to avoid concurrent writes
    const maxRetries = 5;
    for (let i = 0; i < maxRetries; i++) {
      try {
        writeFileSync(this.filePath, JSON.stringify(data, null, 2), { encoding: 'utf8' });
        return;
      } catch (e) {
        Logger.debug('writeFile attempt failed, retrying: ' + e);
      }
    }
    Logger.error('Failed to write auth file after retries');
  }

  validateUser(username: string, password: string): boolean {
    const data = this.readFile();
    if (!data.user) return false;
    if (data.user.username !== username) return false;
    const hash = scryptSync(password, data.user.salt, 64).toString('hex');
    return hash === data.user.hash;
  }

  createSession(username: string) {
    const sid = randomBytes(24).toString('hex');
    const now = Math.floor(Date.now() / 1000);
    const data = this.readFile();
    data.sessions[sid] = { username, createdAt: now };
    this.writeFile(data);
    return sid;
  }

  getUserFromSession(sid: string) {
    const data = this.readFile();
    const s = data.sessions[sid];
    if (!s) return null;
    const now = Math.floor(Date.now() / 1000);
    if (s.createdAt + this.sessionTtl < now) {
      // expired: remove and return null
      delete data.sessions[sid];
      this.writeFile(data);
      return null;
    }
    return s.username;
  }

  destroySession(sid: string) {
    const data = this.readFile();
    if (data.sessions[sid]) {
      delete data.sessions[sid];
      this.writeFile(data);
    }
  }

  changePassword(username: string, oldPassword: string, newPassword: string): boolean {
    const data = this.readFile();
    if (!data.user) return false;
    if (data.user.username !== username) return false;
    const oldHash = scryptSync(oldPassword, data.user.salt, 64).toString('hex');
    if (oldHash !== data.user.hash) return false;
    const newSalt = randomBytes(16).toString('hex');
    const newHash = scryptSync(newPassword, newSalt, 64).toString('hex');
    data.user.salt = newSalt;
    data.user.hash = newHash;
    this.writeFile(data);
    return true;
  }

  /**
   * Remove expired sessions from the auth file based on sessionTtl.
   */
  cleanupExpiredSessions() {
    const data = this.readFile();
    const now = Math.floor(Date.now() / 1000);
    let removed = 0;
    for (const sid of Object.keys(data.sessions)) {
      const s = data.sessions[sid];
      if (!s) continue;
      if (s.createdAt + this.sessionTtl < now) {
        delete data.sessions[sid];
        removed++;
      }
    }
    if (removed > 0) {
      this.writeFile(data);
      Logger.debug(`cleanupExpiredSessions removed ${removed} sessions`);
    }
    return removed;
  }

  // for graceful shutdown/tests
  stopCleanup() {
    if (this.cleanupTimer) {
      clearInterval(this.cleanupTimer);
      this.cleanupTimer = null;
    }
  }
}
