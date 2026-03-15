import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { UsersService } from '../../users/users.service';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserRole } from '../../users/entities/user-role.entity';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    configService: ConfigService,
    private usersService: UsersService,
    @InjectRepository(UserRole)
    private userRoleRepo: Repository<UserRole>,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get('JWT_SECRET'),
    });
  }

  async validate(payload: any) {
    try {
      const user = await this.usersService.findOne(payload.sub);

      if (!user) {
        throw new UnauthorizedException('Invalid token - user not found');
      }

      if (!user.isActive) {
        throw new UnauthorizedException('Account is disabled');
      }

      // Load user roles
      const userRoles = await this.userRoleRepo.find({
        where: { userId: user.id },
        relations: ['role'],
      });

      // Pick highest-privilege role when a user has multiple roles
      const ROLE_PRIORITY: Record<string, number> = {
        super_admin: 4,
        admin: 3,
        seller: 2,
        customer: 1,
      };
      const roleName =
        userRoles
          .map((ur) => ur.role?.name)
          .filter(Boolean)
          .sort(
            (a, b) => (ROLE_PRIORITY[b!] ?? 0) - (ROLE_PRIORITY[a!] ?? 0),
          )[0] ?? null;

      return {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: roleName,
      };
    } catch (error) {
      throw new UnauthorizedException('Invalid token');
    }
  }
}
