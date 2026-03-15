import {
  Controller,
  Get,
  Post,
  Put,
  Body,
  Param,
  Query,
  UsePipes,
  ValidationPipe,
  UseGuards,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiQuery,
  ApiBody,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { SearchService } from './search.service';
import { CreateSearchQueryDto } from './dto/create-search-query.dto';
import { RecordClickDto } from './dto/record-click.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { Public } from '../../common/decorators/public.decorator';

@ApiTags('Search')
@Controller('search')
@UsePipes(new ValidationPipe({ whitelist: true }))
export class SearchController {
  constructor(private readonly svc: SearchService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Log a search query' })
  @ApiResponse({ status: 201, description: 'Search query logged' })
  logSearch(@Body() dto: CreateSearchQueryDto, @CurrentUser() user: any) {
    return this.svc.logSearch({ ...dto, userId: user.id });
  }

  @Get('history')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Get search history for current user' })
  @ApiQuery({
    name: 'limit',
    required: false,
    type: Number,
    description: 'Max results',
  })
  @ApiResponse({ status: 200, description: 'Search history returned' })
  getHistory(@Query('limit') limit?: string, @CurrentUser() user?: any) {
    return this.svc.getHistory(
      user.id,
      limit ? Math.min(Math.max(1, +limit), 100) : undefined,
    );
  }

  @Get('popular')
  @Public()
  @ApiOperation({ summary: 'Get popular search queries' })
  @ApiQuery({
    name: 'limit',
    required: false,
    type: Number,
    description: 'Max results',
  })
  @ApiResponse({ status: 200, description: 'Popular searches returned' })
  getPopular(@Query('limit') limit?: string) {
    return this.svc.getPopularSearches(
      limit ? Math.min(Math.max(1, +limit), 100) : undefined,
    );
  }

  @Put(':id/click')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Record click on a search result' })
  @ApiParam({ name: 'id', description: 'Search query UUID' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: { productId: { type: 'string', format: 'uuid' } },
      required: ['productId'],
    },
  })
  @ApiResponse({ status: 200, description: 'Click recorded' })
  recordClick(
    @Param('id') id: string,
    @Body() dto: RecordClickDto,
    @CurrentUser() user: any,
  ) {
    return this.svc.recordClick(id, dto.productId, user.id);
  }

  @Get('products')
  @Public()
  @ApiOperation({ summary: 'Search products by keyword' })
  @ApiQuery({
    name: 'q',
    required: true,
    type: String,
    description: 'Search query text',
  })
  @ApiQuery({
    name: 'page',
    required: false,
    type: Number,
    description: 'Page number (default: 1)',
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    type: Number,
    description: 'Items per page (default: 20)',
  })
  @ApiQuery({
    name: 'categoryId',
    required: false,
    type: String,
    description: 'Filter by category UUID',
  })
  @ApiQuery({
    name: 'storeId',
    required: false,
    type: String,
    description: 'Filter by store UUID',
  })
  @ApiResponse({ status: 200, description: 'Product search results' })
  searchProducts(
    @Query('q') q: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('categoryId') categoryId?: string,
    @Query('storeId') storeId?: string,
  ) {
    return this.svc.searchProducts(q, {
      page: page ? Math.max(1, +page) : undefined,
      limit: limit ? Math.min(Math.max(1, +limit), 100) : undefined,
      categoryId,
      storeId,
    });
  }
}
