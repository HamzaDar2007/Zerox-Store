import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ChatService } from './chat.service';
import { ChatController } from './chat.controller';
import { ChatGateway } from './chat.gateway';
import { ChatThread } from './entities/chat-thread.entity';
import { ChatThreadParticipant } from './entities/chat-thread-participant.entity';
import { ChatMessage } from './entities/chat-message.entity';
import { SharedModule } from '../shared/shared.module';
import { GuardsModule } from '../../common/modules/guards.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([ChatThread, ChatThreadParticipant, ChatMessage]),
    SharedModule,
    GuardsModule,
  ],
  controllers: [ChatController],
  providers: [ChatService, ChatGateway],
  exports: [ChatService, ChatGateway, TypeOrmModule],
})
export class ChatModule {}
