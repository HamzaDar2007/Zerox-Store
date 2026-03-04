import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Patch,
  Delete,
  UseGuards,
  NotFoundException,
  Request,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { RolesGuard } from '../../common/guards/roles.guard';
import { PermissionsGuard } from '../../common/guards/permissions.guard';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { Permissions } from '../../common/decorators/permissions.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { SecurityUtil } from '../../common/utils/security.util';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { BaseController } from '../../common/controllers/base.controller';
import { User } from './entities/user.entity';

@UseGuards(JwtAuthGuard, RolesGuard, PermissionsGuard)
@ApiTags('Users')
@Controller('users')
export class UsersController extends BaseController {
  constructor(private readonly usersService: UsersService) {
    super();
  }

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'create users' })
  @Permissions('users.create')
  create(@Body() dto: CreateUserDto) {
    return this.handleAsyncOperation(this.usersService.create(dto));
  }

  // ==================== USER PROFILE ====================
  
  @Get('me')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Get current user profile' })
  async getProfile(@CurrentUser() user: User) {
    const profile = await this.usersService.findOneWithPermissions(user.id);
    if (!profile) {
      throw new NotFoundException('User not found');
    }
    return {
      success: true,
      message: 'User profile retrieved successfully',
      data: profile,
    };
  }

  // ====================  PERMISSIONS ====================

  @Get(':id/permissions')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'get user permissions by id' })
  @Permissions('users.read')
  getUserPermissions(@Param('id') id: string) {
    const validId = SecurityUtil.validateId(id);
    return this.handleAsyncOperation(this.usersService.getUserPermissions(validId));
  }

  @Get()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Get users' })
  @Permissions('users.read')
  findAll() {
    return this.handleAsyncOperation(this.usersService.findAll());
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'get user by id' })
  @Permissions('users.read')
  findOne(@Param('id') id: string) {
    const validId = SecurityUtil.validateId(id);
    return this.handleAsyncOperation(this.usersService.findOne(validId));
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'update user by id' })
  @Permissions('users.update')
  update(@Param('id') id: string, @Body() dto: UpdateUserDto) {
    const validId = SecurityUtil.validateId(id);
    return this.handleAsyncOperation(this.usersService.update(validId, dto));
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'delete user by id' })
  @Permissions('users.delete')
  remove(@Param('id') id: string) {
    const validId = SecurityUtil.validateId(id);
    return this.handleAsyncOperation(this.usersService.remove(validId));
  }
}
