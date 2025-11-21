import { Body, Controller, Get, Post, Req, Res, UnauthorizedException } from '@nestjs/common';
import { AuthService } from './auth.service';
import { Request, Response } from 'express';

@Controller('auth')
export class AuthController {
  constructor(private readonly auth: AuthService) {}

  @Post('login')
  login(@Body() body: { username: string; password: string }, @Res() res: Response) {
    const { username, password } = body || { username: '', password: '' };
    if (!this.auth.validateUser(username, password)) {
      throw new UnauthorizedException('Invalid credentials');
    }
    const sid = this.auth.createSession(username);
    // set cookie manually (no cookie-parser dependency)
    res.setHeader('Set-Cookie', `ALISTRM_SESSION=${sid}; HttpOnly; Path=/; SameSite=Lax`);
    return res.json({ ok: true });
  }

  @Post('logout')
  logout(@Req() req: Request, @Res() res: Response) {
    const sid = this.getCookie(req, 'ALISTRM_SESSION');
    if (sid) this.auth.destroySession(sid);
    res.setHeader('Set-Cookie', `ALISTRM_SESSION=; HttpOnly; Path=/; Max-Age=0; SameSite=Lax`);
    return res.json({ ok: true });
  }

  @Get('me')
  me(@Req() req: Request) {
    const sid = this.getCookie(req, 'ALISTRM_SESSION');
    if (!sid) return { authenticated: false };
    const u = this.auth.getUserFromSession(sid);
    if (!u) return { authenticated: false };
    return { authenticated: true, username: u };
  }

  @Post('change-password')
  change(@Req() req: Request, @Body() body: { oldPassword: string; newPassword: string }) {
    const sid = this.getCookie(req, 'ALISTRM_SESSION');
    if (!sid) throw new UnauthorizedException();
    const u = this.auth.getUserFromSession(sid);
    if (!u) throw new UnauthorizedException();
    const ok = this.auth.changePassword(u, body.oldPassword, body.newPassword);
    if (!ok) throw new UnauthorizedException('Password change failed');
    return { ok: true };
  }

  private getCookie(req: Request, name: string) {
    const header = req.headers['cookie'] as string | undefined;
    if (!header) return null;
    const parts = header.split(';').map(p => p.trim());
    for (const p of parts) {
      if (p.startsWith(name + '=')) return decodeURIComponent(p.substring(name.length + 1));
    }
    return null;
  }
}
