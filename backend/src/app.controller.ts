import { Controller, Get, HttpStatus, Res } from '@nestjs/common';
import { AppService } from './app.service';
import { BaseController } from './common/controllers/base.controller';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { DataSource } from 'typeorm';
import { Public } from './common/decorators/public.decorator';
import { Response } from 'express';

@ApiTags('Health')
@Controller()
@Public()
export class AppController extends BaseController {
  constructor(
    private readonly appService: AppService,
    private readonly dataSource: DataSource,
  ) {
    super();
  }

  @Get()
  @ApiOperation({ summary: 'Root endpoint' })
  @ApiResponse({ status: 200, description: 'Welcome message' })
  getHello(): string {
    return this.appService.getHello();
  }

  @Get('health')
  @ApiOperation({ summary: 'Health check endpoint' })
  @ApiResponse({ status: 200, description: 'Service healthy' })
  @ApiResponse({ status: 503, description: 'Service degraded' })
  async healthCheck(@Res() res: Response) {
    let dbStatus = 'down';
    try {
      await this.dataSource.query('SELECT 1');
      dbStatus = 'up';
    } catch {
      dbStatus = 'down';
    }
    const isHealthy = dbStatus === 'up';
    const statusCode = isHealthy
      ? HttpStatus.OK
      : HttpStatus.SERVICE_UNAVAILABLE;
    res.status(statusCode).json({
      success: isHealthy,
      message: 'API is running',
      timestamp: new Date().toISOString(),
      version: '1.0.0',
      status: isHealthy ? 'healthy' : 'degraded',
      database: dbStatus,
    });
  }
}
