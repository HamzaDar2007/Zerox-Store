import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { User } from './entities/user.entity';
import { UserRole } from './entities/user-role.entity';
import { Role } from '../roles/entities/role.entity';
import { Permission } from '../permissions/entities/permission.entity';
import { TokenUtil } from 'src/common/utils/jwt.util';
import { SharedModule } from '../shared/shared.module';
import { GuardsModule } from '../../common/modules/guards.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      User,
      UserRole,
      Role,
      Permission,
    ]),
    SharedModule,
    GuardsModule,
  ],
  controllers: [UsersController],
  providers: [UsersService, TokenUtil],
  exports: [UsersService, TokenUtil, TypeOrmModule],
})
export class UsersModule {}
