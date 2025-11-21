import { Controller, Get, Query } from '@nestjs/common';
import { AlistService } from './alist.service';

@Controller('api/fs')
export class AlistController {

  constructor(private readonly alistService: AlistService) {}

  @Get('list')
  async list(@Query('path') path: string) {
    // Forward request to AlistService and return raw data
    return this.alistService.request('/api/fs/list', { path: path || '/' });
  }

}
