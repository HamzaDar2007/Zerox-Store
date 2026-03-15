import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayConnection,
  OnGatewayDisconnect,
  ConnectedSocket,
  MessageBody,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Logger } from '@nestjs/common';
import { ChatService } from './chat.service';
import { JwtService } from '@nestjs/jwt';

const parseOrigins = (raw?: string): string[] =>
  (raw ?? '')
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);

const allowedOrigins = new Set(parseOrigins(process.env.FRONTEND_URLS));
const localhostPattern = /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/i;

@WebSocketGateway({
  cors: {
    origin: (
      origin: string | undefined,
      cb: (err: Error | null, allow?: boolean) => void,
    ) => {
      if (!origin) return cb(null, true);
      if (allowedOrigins.has(origin)) return cb(null, true);
      if (
        process.env.NODE_ENV !== 'production' &&
        localhostPattern.test(origin)
      )
        return cb(null, true);
      cb(new Error('CORS blocked'));
    },
    credentials: true,
  },
  namespace: '/chat',
})
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private readonly logger = new Logger(ChatGateway.name);
  /** Map userId → Set of socket IDs */
  private userSockets = new Map<string, Set<string>>();
  /** Map socketId → authenticated userId */
  private socketUsers = new Map<string, string>();

  constructor(
    private readonly chatService: ChatService,
    private readonly jwtService: JwtService,
  ) {}

  handleConnection(client: Socket) {
    const token =
      client.handshake.auth?.token || (client.handshake.query?.token as string);
    if (!token) {
      this.logger.warn(`Socket ${client.id} rejected — no token`);
      client.disconnect(true);
      return;
    }

    try {
      const payload = this.jwtService.verify(token);
      const userId = payload.sub;
      if (!userId) throw new Error('No sub in token');

      this.socketUsers.set(client.id, userId);
      if (!this.userSockets.has(userId)) {
        this.userSockets.set(userId, new Set());
      }
      this.userSockets.get(userId).add(client.id);
      this.logger.log(`User ${userId} connected (socket: ${client.id})`);
    } catch {
      this.logger.warn(`Socket ${client.id} rejected — invalid token`);
      client.disconnect(true);
    }
  }

  handleDisconnect(client: Socket) {
    const userId = this.socketUsers.get(client.id);
    if (userId && this.userSockets.has(userId)) {
      this.userSockets.get(userId).delete(client.id);
      if (this.userSockets.get(userId).size === 0) {
        this.userSockets.delete(userId);
      }
    }
    this.socketUsers.delete(client.id);
    this.logger.log(`Socket disconnected: ${client.id}`);
  }

  /** Get the authenticated userId for a socket, or throw disconnect */
  private getAuthUserId(client: Socket): string {
    const userId = this.socketUsers.get(client.id);
    if (!userId) {
      client.disconnect(true);
      throw new Error('Unauthenticated socket');
    }
    return userId;
  }

  @SubscribeMessage('joinThread')
  handleJoinThread(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { threadId: string },
  ) {
    this.getAuthUserId(client);
    client.join(`thread:${data.threadId}`);
    this.logger.debug(`Socket ${client.id} joined thread:${data.threadId}`);
    return { event: 'joinedThread', data: { threadId: data.threadId } };
  }

  @SubscribeMessage('leaveThread')
  handleLeaveThread(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { threadId: string },
  ) {
    client.leave(`thread:${data.threadId}`);
    return { event: 'leftThread', data: { threadId: data.threadId } };
  }

  @SubscribeMessage('sendMessage')
  async handleSendMessage(
    @ConnectedSocket() client: Socket,
    @MessageBody()
    data: { threadId: string; body: string; attachmentUrl?: string },
  ) {
    const senderId = this.getAuthUserId(client);
    const message = await this.chatService.sendMessage({
      threadId: data.threadId,
      senderId,
      body: data.body,
      attachmentUrl: data.attachmentUrl || null,
    });

    // Broadcast to all sockets in the thread room (except sender)
    client.to(`thread:${data.threadId}`).emit('newMessage', message);

    // Also return the saved message to the sender
    return { event: 'messageSent', data: message };
  }

  @SubscribeMessage('typing')
  handleTyping(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { threadId: string },
  ) {
    const userId = this.getAuthUserId(client);
    client.to(`thread:${data.threadId}`).emit('userTyping', {
      threadId: data.threadId,
      userId,
    });
  }

  @SubscribeMessage('stopTyping')
  handleStopTyping(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { threadId: string },
  ) {
    const userId = this.getAuthUserId(client);
    client.to(`thread:${data.threadId}`).emit('userStoppedTyping', {
      threadId: data.threadId,
      userId,
    });
  }

  @SubscribeMessage('markRead')
  async handleMarkRead(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { threadId: string },
  ) {
    const userId = this.getAuthUserId(client);
    await this.chatService.updateLastRead(data.threadId, userId);
    client.to(`thread:${data.threadId}`).emit('threadRead', {
      threadId: data.threadId,
      userId,
    });
    return { event: 'markedRead', data: { threadId: data.threadId } };
  }

  /**
   * Emit to specific user's sockets (for push notification from server-side code).
   */
  emitToUser(userId: string, event: string, payload: any) {
    const sockets = this.userSockets.get(userId);
    if (sockets) {
      for (const socketId of sockets) {
        this.server.to(socketId).emit(event, payload);
      }
    }
  }
}
