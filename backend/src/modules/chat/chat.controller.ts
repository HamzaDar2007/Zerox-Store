import {
  Controller,
  Get,
  Post,
  Put,
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
import { ChatService } from './chat.service';
import { CreateChatThreadDto } from './dto/create-chat-thread.dto';
import { UpdateChatThreadDto } from './dto/update-chat-thread.dto';
import { CreateChatMessageDto } from './dto/create-chat-message.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@ApiTags('Chat')
@Controller('chat')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth('JWT-auth')
@UsePipes(new ValidationPipe({ whitelist: true }))
export class ChatController {
  constructor(private readonly svc: ChatService) {}

  @Post('threads')
  @ApiOperation({ summary: 'Create a chat thread' })
  @ApiResponse({ status: 201, description: 'Thread created' })
  createThread(@Body() dto: CreateChatThreadDto, @CurrentUser() user: any) {
    const participantIds = dto.participantUserIds || [];
    if (!participantIds.includes(user.id)) participantIds.push(user.id);
    return this.svc.createThread(dto, participantIds);
  }

  @Get('threads/:id')
  @ApiOperation({ summary: 'Get chat thread by ID' })
  @ApiParam({ name: 'id', description: 'Thread UUID' })
  @ApiResponse({ status: 200, description: 'Thread found' })
  findThread(@Param('id') id: string, @CurrentUser() user: any) {
    return this.svc.findThread(id, user.id);
  }

  @Get('mine/threads')
  @ApiOperation({ summary: 'Get all threads for current user' })
  @ApiResponse({ status: 200, description: 'User threads returned' })
  getUserThreads(@CurrentUser() user: any) {
    return this.svc.getUserThreads(user.id);
  }

  @Put('threads/:id/status')
  @ApiOperation({ summary: 'Update thread status' })
  @ApiParam({ name: 'id', description: 'Thread UUID' })
  @ApiResponse({ status: 200, description: 'Thread status updated' })
  updateStatus(
    @Param('id') id: string,
    @Body() dto: UpdateChatThreadDto,
    @CurrentUser() user: any,
  ) {
    return this.svc.updateThreadStatus(id, dto.status, user.id);
  }

  @Post('messages')
  @ApiOperation({ summary: 'Send a message in a thread' })
  @ApiResponse({ status: 201, description: 'Message sent' })
  sendMessage(@Body() dto: CreateChatMessageDto, @CurrentUser() user: any) {
    return this.svc.sendMessage({ ...dto, senderId: user.id });
  }

  @Get('threads/:id/messages')
  @ApiOperation({ summary: 'Get all messages in a thread' })
  @ApiParam({ name: 'id', description: 'Thread UUID' })
  @ApiResponse({ status: 200, description: 'Messages returned' })
  getMessages(@Param('id') id: string, @CurrentUser() user: any) {
    return this.svc.getMessages(id, user.id);
  }

  @Get('threads/:id/participants')
  @ApiOperation({ summary: 'Get participants in a thread' })
  @ApiParam({ name: 'id', description: 'Thread UUID' })
  @ApiResponse({ status: 200, description: 'Participants returned' })
  getParticipants(@Param('id') id: string, @CurrentUser() user: any) {
    return this.svc.getParticipants(id, user.id);
  }

  @Put('threads/:threadId/read')
  @ApiOperation({ summary: 'Mark thread as read by current user' })
  @ApiParam({ name: 'threadId', description: 'Thread UUID' })
  @ApiResponse({ status: 200, description: 'Last read updated' })
  updateLastRead(
    @Param('threadId') threadId: string,
    @CurrentUser() user: any,
  ) {
    return this.svc.updateLastRead(threadId, user.id);
  }
}
