import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { AlistService } from './alist.service';
import { AuthGuard } from '../auth/auth.guard';

@Controller('api/fs')
@UseGuards(AuthGuard)
export class AlistController {

  constructor(private readonly alistService: AlistService) {}

  @Get('list')
  async list(@Query('path') path: string) {
    // Forward request to AlistService and return raw data
    return this.alistService.request('/api/fs/list', { path: path || '/' });
  }

}
