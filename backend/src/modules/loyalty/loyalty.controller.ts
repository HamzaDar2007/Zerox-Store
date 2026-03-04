import { Controller, Get, Post, Patch, Delete, Body, Param, Query, UseGuards, ParseUUIDPipe } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { LoyaltyService } from './loyalty.service';
import { CreateLoyaltyTierDto } from './dto/create-loyalty-tier.dto';
import { UpdateLoyaltyTierDto } from './dto/update-loyalty-tier.dto';
import { CreateLoyaltyTransactionDto } from './dto/create-loyalty-transaction.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PermissionsGuard } from '../../common/guards/permissions.guard';
import { Permissions } from '../../common/decorators/permissions.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { User } from '../users/entities/user.entity';
import { BaseController } from '../../common/controllers/base.controller';

@ApiTags('Loyalty')
@Controller('loyalty')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth('JWT-auth')
export class LoyaltyController extends BaseController {
  constructor(private readonly loyaltyService: LoyaltyService) { super(); }

  @Get('points')
  @ApiOperation({ summary: 'Get my loyalty points' })
  getMyPoints(@CurrentUser() user: User) {
    return this.handleAsyncOperation(this.loyaltyService.getOrCreatePoints(user.id));
  }

  @Post('points/earn')
  @UseGuards(PermissionsGuard)
  @ApiOperation({ summary: 'Earn points (admin)' })
  @Permissions('loyalty.create')
  earnPoints(@Body() dto: CreateLoyaltyTransactionDto) {
    return this.handleAsyncOperation(this.loyaltyService.earnPoints(dto.userId, dto));
  }

  @Post('points/redeem')
  @ApiOperation({ summary: 'Redeem points' })
  redeemPoints(@CurrentUser() user: User, @Body() dto: { points: number; orderId?: string }) {
    return this.handleAsyncOperation(this.loyaltyService.redeemPoints(user.id, dto));
  }

  @Get('transactions')
  @ApiOperation({ summary: 'Get my transactions' })
  getMyTransactions(@CurrentUser() user: User, @Query('page') page?: number, @Query('limit') limit?: number) {
    return this.handleAsyncOperation(this.loyaltyService.getTransactions(user.id, page, limit));
  }

  @Get('tiers')
  @ApiOperation({ summary: 'Get loyalty tiers' })
  getTiers() {
    return this.handleAsyncOperation(this.loyaltyService.getTiers());
  }

  @Post('tiers')
  @UseGuards(PermissionsGuard)
  @ApiOperation({ summary: 'Create tier' })
  @Permissions('loyalty.create')
  createTier(@Body() dto: CreateLoyaltyTierDto) {
    return this.handleAsyncOperation(this.loyaltyService.createTier(dto));
  }

  @Patch('tiers/:id')
  @UseGuards(PermissionsGuard)
  @ApiOperation({ summary: 'Update tier' })
  @Permissions('loyalty.update')
  updateTier(@Param('id', ParseUUIDPipe) id: string, @Body() dto: UpdateLoyaltyTierDto) {
    return this.handleAsyncOperation(this.loyaltyService.updateTier(id, dto));
  }

  @Delete('tiers/:id')
  @UseGuards(PermissionsGuard)
  @ApiOperation({ summary: 'Delete tier' })
  @Permissions('loyalty.delete')
  deleteTier(@Param('id', ParseUUIDPipe) id: string) {
    return this.handleAsyncOperation(this.loyaltyService.deleteTier(id));
  }

  @Get('referral-code')
  @ApiOperation({ summary: 'Get my referral code' })
  getMyReferralCode(@CurrentUser() user: User) {
    return this.handleAsyncOperation(this.loyaltyService.getOrCreateReferralCode(user.id));
  }

  @Post('referral/apply')
  @ApiOperation({ summary: 'Apply referral code' })
  applyReferral(@CurrentUser() user: User, @Body('code') code: string) {
    return this.handleAsyncOperation(this.loyaltyService.applyReferralCode(user.id, code));
  }

  @Get('referrals')
  @ApiOperation({ summary: 'Get my referrals' })
  getMyReferrals(@CurrentUser() user: User) {
    return this.handleAsyncOperation(this.loyaltyService.getReferrals(user.id));
  }
}
