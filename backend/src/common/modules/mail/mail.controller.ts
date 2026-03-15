import {
  Controller,
  Post,
  Body,
  HttpCode,
  HttpStatus,
  UseGuards,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBody,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { IsEmail, IsNotEmpty } from 'class-validator';
import { MailService } from './mail.service';
import { JwtAuthGuard } from '../../../modules/auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../guards/roles.guard';
import { Roles } from '../../decorators/roles.decorator';
import { RoleEnum } from '../../../modules/roles/role.enum';

class SendTestEmailDto {
  @IsEmail()
  @IsNotEmpty()
  to: string;
}

@ApiTags('Mail')
@Controller('mail')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(RoleEnum.ADMIN, RoleEnum.SUPER_ADMIN)
@ApiBearerAuth('JWT-auth')
export class MailController {
  constructor(private readonly mailService: MailService) {}

  @Post('test')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Send a test email to verify SMTP configuration' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        to: {
          type: 'string',
          example: 'test@example.com',
          description: 'Recipient email address',
        },
      },
      required: ['to'],
    },
  })
  @ApiResponse({ status: 200, description: 'Test email sent successfully' })
  @ApiResponse({ status: 500, description: 'Failed to send test email' })
  async sendTestEmail(@Body() dto: SendTestEmailDto) {
    const success = await this.mailService.sendTestEmail(dto.to);
    return {
      success,
      message: success
        ? `Test email sent successfully to ${dto.to}`
        : `Failed to send test email to ${dto.to}. Check server logs for details.`,
    };
  }
}
