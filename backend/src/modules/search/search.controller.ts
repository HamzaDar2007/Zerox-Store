import {
  Controller,
  Get,
  Post,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  ParseUUIDPipe,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiBearerAuth,
  ApiQuery,
} from '@nestjs/swagger';
import { SearchService } from './search.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { User } from '../users/entities/user.entity';
import { BaseController } from '../../common/controllers/base.controller';

@ApiTags('Search')
@Controller('search')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth('JWT-auth')
export class SearchController extends BaseController {
  constructor(private readonly searchService: SearchService) {
    super();
  }

  @Post('history')
  @ApiOperation({ summary: 'Save search query' })
  saveHistory(@Body('query') query: string, @CurrentUser() user: User) {
    return this.handleAsyncOperation(
      this.searchService.saveSearchHistory(user.id, query),
    );
  }

  @Get('history')
  @ApiOperation({ summary: 'Get search history' })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  getHistory(@CurrentUser() user: User, @Query('limit') limit?: number) {
    return this.handleAsyncOperation(
      this.searchService.getSearchHistory(user.id, limit),
    );
  }

  @Delete('history')
  @ApiOperation({ summary: 'Clear search history' })
  clearHistory(@CurrentUser() user: User) {
    return this.handleAsyncOperation(
      this.searchService.clearSearchHistory(user.id),
    );
  }

  @Post('recently-viewed/:productId')
  @ApiOperation({ summary: 'Add to recently viewed' })
  addRecentlyViewed(
    @Param('productId', ParseUUIDPipe) productId: string,
    @CurrentUser() user: User,
  ) {
    return this.handleAsyncOperation(
      this.searchService.addRecentlyViewed(user.id, productId),
    );
  }

  @Get('recently-viewed')
  @ApiOperation({ summary: 'Get recently viewed products' })
  getRecentlyViewed(@CurrentUser() user: User, @Query('limit') limit?: number) {
    return this.handleAsyncOperation(
      this.searchService.getRecentlyViewed(user.id, limit),
    );
  }

  @Post('compare/:productId')
  @ApiOperation({ summary: 'Add product to comparison' })
  addToComparison(
    @Param('productId', ParseUUIDPipe) productId: string,
    @CurrentUser() user: User,
  ) {
    return this.handleAsyncOperation(
      this.searchService.addToComparison(user.id, productId),
    );
  }

  @Get('compare')
  @ApiOperation({ summary: 'Get comparison list' })
  getComparison(@CurrentUser() user: User) {
    return this.handleAsyncOperation(this.searchService.getComparison(user.id));
  }

  @Delete('compare/:productId')
  @ApiOperation({ summary: 'Remove from comparison' })
  removeFromComparison(
    @Param('productId', ParseUUIDPipe) productId: string,
    @CurrentUser() user: User,
  ) {
    return this.handleAsyncOperation(
      this.searchService.removeFromComparison(user.id, productId),
    );
  }

  @Get('recommendations')
  @ApiOperation({ summary: 'Get product recommendations' })
  @ApiQuery({ name: 'productId', required: true, type: String })
  getRecommendations(@Query('productId', ParseUUIDPipe) productId: string) {
    return this.handleAsyncOperation(
      this.searchService.getRecommendations(productId),
    );
  }
}
