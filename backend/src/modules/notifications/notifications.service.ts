import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Notification } from './entities/notification.entity';

@Injectable()
export class NotificationsService {
  constructor(
    @InjectRepository(Notification) private notifRepo: Repository<Notification>,
  ) {}

  async create(
    userId: string,
    dto: Partial<Notification>,
  ): Promise<Notification> {
    const notif = this.notifRepo.create({ userId, ...dto });
    return this.notifRepo.save(notif);
  }

  async findByUser(
    userId: string,
    page = 1,
    limit = 20,
  ): Promise<Notification[]> {
    return this.notifRepo.find({
      where: { userId },
      order: { createdAt: 'DESC' },
      take: limit,
      skip: (page - 1) * limit,
    });
  }

  async findOne(id: string): Promise<Notification> {
    const notif = await this.notifRepo.findOne({ where: { id } });
    if (!notif) throw new NotFoundException('Notification not found');
    return notif;
  }

  async findOneForUser(
    id: string,
    callerId: string,
    callerRole?: string,
  ): Promise<Notification> {
    const notif = await this.findOne(id);
    if (
      callerRole !== 'admin' &&
      callerRole !== 'super_admin' &&
      notif.userId !== callerId
    ) {
      throw new ForbiddenException(
        'You do not have access to this notification',
      );
    }
    return notif;
  }

  async markRead(id: string, callerId: string): Promise<Notification> {
    const notif = await this.findOne(id);
    if (notif.userId !== callerId)
      throw new ForbiddenException(
        'You do not have access to this notification',
      );
    notif.isRead = true;
    notif.readAt = new Date();
    return this.notifRepo.save(notif);
  }

  async markAllRead(userId: string): Promise<void> {
    await this.notifRepo.update(
      { userId, isRead: false },
      { isRead: true, readAt: new Date() },
    );
  }

  async getUnreadCount(userId: string): Promise<number> {
    return this.notifRepo.count({ where: { userId, isRead: false } });
  }

  async remove(id: string, callerId: string): Promise<void> {
    const notif = await this.findOne(id);
    if (notif.userId !== callerId)
      throw new ForbiddenException(
        'You do not have access to this notification',
      );
    await this.notifRepo.delete(id);
  }
}
