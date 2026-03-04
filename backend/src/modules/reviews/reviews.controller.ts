import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  ParseUUIDPipe,
  Query,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiQuery,
} from '@nestjs/swagger';
import { ReviewsService } from './reviews.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PermissionsGuard } from '../../common/guards/permissions.guard';
import { Permissions } from '../../common/decorators/permissions.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { User } from '../users/entities/user.entity';
import { BaseController } from '../../common/controllers/base.controller';
import { ReviewStatus, ReviewReportReason } from '@common/enums';
import { CreateReviewDto } from './dto/create-review.dto';
import { UpdateReviewDto } from './dto/update-review.dto';

@ApiTags('Reviews')
@Controller('reviews')
export class ReviewsController extends BaseController {
  constructor(private readonly reviewsService: ReviewsService) {
    super();
  }

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Create review' })
  @ApiResponse({ status: 201, description: 'Review created' })
  create(@Body() dto: CreateReviewDto, @CurrentUser() user: User) {
    return this.handleAsyncOperation(this.reviewsService.create(dto, user.id));
  }

  @Get()
  @ApiOperation({ summary: 'Get all reviews' })
  @ApiQuery({ name: 'productId', required: false })
  @ApiQuery({ name: 'userId', required: false })
  @ApiQuery({ name: 'status', required: false, enum: ReviewStatus })
  @ApiQuery({ name: 'minRating', required: false, type: Number })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  findAll(
    @Query('productId') productId?: string,
    @Query('userId') userId?: string,
    @Query('status') status?: ReviewStatus,
    @Query('minRating') minRating?: number,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ) {
    return this.handleAsyncOperation(
      this.reviewsService.findAll({ productId, userId, status, minRating, page, limit }),
    );
  }

  @Get('product/:productId/summary')
  @ApiOperation({ summary: 'Get product rating summary' })
  getRatingSummary(@Param('productId', ParseUUIDPipe) productId: string) {
    return this.handleAsyncOperation(this.reviewsService.getProductRatingSummary(productId));
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get review by ID' })
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.handleAsyncOperation(this.reviewsService.findOne(id));
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Update review' })
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateReviewDto,
    @CurrentUser() user: User,
  ) {
    return this.handleAsyncOperation(this.reviewsService.update(id, dto, user.id));
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Delete review' })
  remove(@Param('id', ParseUUIDPipe) id: string, @CurrentUser() user: User) {
    return this.handleAsyncOperation(this.reviewsService.remove(id, user.id));
  }

  @Patch(':id/status')
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Update review status' })
  @Permissions('reviews.update')
  updateStatus(
    @Param('id', ParseUUIDPipe) id: string,
    @Body('status') status: ReviewStatus,
  ) {
    return this.handleAsyncOperation(this.reviewsService.updateStatus(id, status));
  }

  @Post(':id/helpful')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Mark review as helpful/unhelpful' })
  markHelpful(
    @Param('id', ParseUUIDPipe) id: string,
    @Body('isHelpful') isHelpful: boolean,
    @CurrentUser() user: User,
  ) {
    return this.handleAsyncOperation(this.reviewsService.markHelpful(id, user.id, isHelpful));
  }

  @Post(':id/report')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Report a review' })
  report(
    @Param('id', ParseUUIDPipe) id: string,
    @Body('reason') reason: ReviewReportReason,
    @CurrentUser() user: User,
  ) {
    return this.handleAsyncOperation(this.reviewsService.reportReview(id, user.id, reason));
  }
}
