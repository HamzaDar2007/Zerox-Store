import { Controller, Get, Post, Body, Param, Query, UseGuards, ParseUUIDPipe } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { ChatService } from './chat.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { User } from '../users/entities/user.entity';
import { BaseController } from '../../common/controllers/base.controller';
import { CreateConversationDto } from './dto/create-conversation.dto';
import { CreateMessageDto } from './dto/create-message.dto';

@ApiTags('Chat')
@Controller('chat')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth('JWT-auth')
export class ChatController extends BaseController {
  constructor(private readonly chatService: ChatService) { super(); }

  @Post('conversations')
  @ApiOperation({ summary: 'Create conversation' })
  createConversation(@Body() dto: CreateConversationDto) {
    return this.handleAsyncOperation(this.chatService.createConversation(dto));
  }

  @Get('conversations')
  @ApiOperation({ summary: 'Get user conversations' })
  getConversations(@CurrentUser() user: User) {
    return this.handleAsyncOperation(this.chatService.findConversations(user.id));
  }

  @Get('conversations/:id')
  @ApiOperation({ summary: 'Get conversation by ID' })
  getConversation(@Param('id', ParseUUIDPipe) id: string) {
    return this.handleAsyncOperation(this.chatService.findOne(id));
  }

  @Post('conversations/:id/messages')
  @ApiOperation({ summary: 'Send message' })
  sendMessage(@Param('id', ParseUUIDPipe) id: string, @Body() dto: CreateMessageDto, @CurrentUser() user: User) {
    return this.handleAsyncOperation(this.chatService.sendMessage(id, user.id, dto));
  }

  @Get('conversations/:id/messages')
  @ApiOperation({ summary: 'Get conversation messages' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  getMessages(
    @Param('id', ParseUUIDPipe) id: string,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ) {
    return this.handleAsyncOperation(this.chatService.getMessages(id, page, limit));
  }

  @Post('conversations/:id/read')
  @ApiOperation({ summary: 'Mark conversation as read' })
  markAsRead(@Param('id', ParseUUIDPipe) id: string, @CurrentUser() user: User) {
    return this.handleAsyncOperation(this.chatService.markAsRead(id, user.id));
  }

  @Get('unread-count')
  @ApiOperation({ summary: 'Get unread message count' })
  getUnreadCount(@CurrentUser() user: User) {
    return this.handleAsyncOperation(this.chatService.getUnreadCount(user.id));
  }
}
