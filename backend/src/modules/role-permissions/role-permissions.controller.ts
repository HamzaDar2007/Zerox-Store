import {
  Controller,
  Get,
  Post,
  Delete,
  Body,
  Param,
  UsePipes,
  ValidationPipe,
  UseGuards,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
} from '@nestjs/swagger';
import { RolePermissionsService } from './role-permissions.service';
import { AssignRolePermissionsDto } from './dto/assign-role-permissions.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { RoleEnum } from '../roles/role.enum';

@ApiTags('Role Permissions')
@Controller('role-permissions')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(RoleEnum.ADMIN, RoleEnum.SUPER_ADMIN)
@ApiBearerAuth('JWT-auth')
@UsePipes(new ValidationPipe({ whitelist: true }))
export class RolePermissionsController {
  constructor(private readonly rpService: RolePermissionsService) {}

  @Post()
  @ApiOperation({ summary: 'Assign permissions to a role (Admin only)' })
  @ApiResponse({ status: 201, description: 'Permissions assigned to role' })
  assign(@Body() dto: AssignRolePermissionsDto) {
    return this.rpService.assign(dto.roleId, dto.permissionIds);
  }

  @Get(':roleId')
  @ApiOperation({ summary: 'Get all permissions for a role (Admin only)' })
  @ApiParam({ name: 'roleId', description: 'Role UUID' })
  @ApiResponse({ status: 200, description: 'Role permissions returned' })
  findByRole(@Param('roleId') roleId: string) {
    return this.rpService.findByRole(roleId);
  }

  @Delete(':roleId/:permissionId')
  @ApiOperation({ summary: 'Remove a permission from a role (Admin only)' })
  @ApiParam({ name: 'roleId', description: 'Role UUID' })
  @ApiParam({ name: 'permissionId', description: 'Permission UUID' })
  @ApiResponse({ status: 200, description: 'Permission removed from role' })
  remove(
    @Param('roleId') roleId: string,
    @Param('permissionId') permissionId: string,
  ) {
    return this.rpService.remove(roleId, permissionId);
  }
}
