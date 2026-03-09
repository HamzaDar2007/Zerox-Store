import { Controller, Post, Body, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBody } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty } from 'class-validator';
import { MailService } from './mail.service';

class SendTestEmailDto {
  @IsEmail()
  @IsNotEmpty()
  to: string;
}

@ApiTags('Mail')
@Controller('mail')
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
