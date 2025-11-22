import { Controller, Get, Res, Req } from '@nestjs/common';
import { Response, Request } from 'express';
import { join } from 'path';
import { AuthService } from './auth/auth.service';

@Controller()
export class AppController {
  constructor(private readonly auth: AuthService) {}

  @Get()
  home(@Res() res: Response) {
    // Redirect root to the UI (served under /ui)
    return res.redirect('/ui/');
  }

  // Serve the UI root and choose login or index server-side to avoid client-side flicker
  @Get('ui')
  uiRoot(@Req() req: Request, @Res() res: Response) {
    return this.serveUiByAuth(req, res);
  }

  @Get('ui/index.html')
  uiIndex(@Req() req: Request, @Res() res: Response) {
    return this.serveUiByAuth(req, res);
  }

  private serveUiByAuth(req: Request, res: Response) {
    // read session cookie (ALISTRM_SESSION)
    const header = req.headers['cookie'] as string | undefined;
    let sid: string | null = null;
    if (header) {
      const parts = header.split(';').map(p => p.trim());
      for (const p of parts) {
        if (p.startsWith('ALISTRM_SESSION=')) {
          sid = decodeURIComponent(p.substring('ALISTRM_SESSION='.length));
          break;
        }
      }
    }

    const user = sid ? this.auth.getUserFromSession(sid) : null;
    const uiDir = join(__dirname, '..', 'public', 'ui');
    if (user) {
      return res.sendFile(join(uiDir, 'index.html'));
    }
    return res.sendFile(join(uiDir, 'login.html'));
  }
}
