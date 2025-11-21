import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { AuthService } from './auth.service';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(private readonly auth: AuthService) {}

  canActivate(context: ExecutionContext): boolean {
    const req = context.switchToHttp().getRequest();
    // allow if cookie contains valid session (no cookie-parser dependency)
    const header = req.headers && req.headers.cookie;
    if (!header) return false;
    const parts = String(header).split(';').map((p: string) => p.trim());
    let sid: string | null = null;
    for (const p of parts) {
      if (p.startsWith('ALISTRM_SESSION=')) {
        sid = decodeURIComponent(p.substring('ALISTRM_SESSION='.length));
        break;
      }
    }
    if (!sid) return false;
    const u = this.auth.getUserFromSession(sid);
    return !!u;
  }
}
