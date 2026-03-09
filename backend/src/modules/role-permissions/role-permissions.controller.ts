import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  UseGuards,
} from '@nestjs/common';
import { RolePermissionsService } from './role-permissions.service';
import { AssignRolePermissionsDto } from './dto/assign-role-permissions.dto';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { PermissionsGuard } from '../../common/guards/permissions.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { Permissions } from '../../common/decorators/permissions.decorator';
import { RoleEnum } from '../roles/role.enum';
import { BaseController } from '../../common/controllers/base.controller';

@ApiTags('Role Permissions')
@Controller('role-permissions')
@UseGuards(JwtAuthGuard, RolesGuard, PermissionsGuard)
@ApiBearerAuth('JWT-auth')
@Roles(RoleEnum.ADMIN, RoleEnum.SUPER_ADMIN)
export class RolePermissionsController extends BaseController {
  constructor(private readonly rolePermissionsService: RolePermissionsService) {
    super();
  }

  @Post(':roleId')
  @ApiOperation({ summary: 'Assign permissions to a role' })
  @Permissions('roles.manage')
  assignPermissions(
    @Param('roleId') roleId: string,
    @Body() dto: AssignRolePermissionsDto,
  ) {
    return this.handleAsyncOperation(
      this.rolePermissionsService.assignPermissions(roleId, dto),
    );
  }

  @Get(':roleId')
  @ApiOperation({ summary: 'Retrieve permissions for a role' })
  @Permissions('roles.read')
  getPermissions(@Param('roleId') roleId: string) {
    return this.handleAsyncOperation(
      this.rolePermissionsService.getPermissionsByRole(roleId),
    );
  }

  @Delete(':roleId/:permissionId')
  @ApiOperation({ summary: 'Remove a permission from a role' })
  @Permissions('roles.manage')
  removePermission(
    @Param('roleId') roleId: string,
    @Param('permissionId') permissionId: string,
  ) {
    return this.handleAsyncOperation(
      this.rolePermissionsService.removePermission(roleId, permissionId),
    );
  }
}
