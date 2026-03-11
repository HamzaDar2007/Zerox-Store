import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, IsNull } from 'typeorm';
import { Notification } from './entities/notification.entity';
import { NotificationPreference } from './entities/notification-preference.entity';
import { NotificationTemplate } from './entities/notification-template.entity';
import { ServiceResponse } from '../../common/interfaces/service-response.interface';
import {
  CreateNotificationTemplateDto,
  UpdateNotificationTemplateDto,
} from './dto';

@Injectable()
export class NotificationsService {
  constructor(
    @InjectRepository(Notification)
    private notificationRepository: Repository<Notification>,
    @InjectRepository(NotificationPreference)
    private preferenceRepository: Repository<NotificationPreference>,
    @InjectRepository(NotificationTemplate)
    private templateRepository: Repository<NotificationTemplate>,
  ) {}

  async create(
    userId: string,
    dto: any,
  ): Promise<ServiceResponse<Notification>> {
    const notification = new Notification();
    Object.assign(notification, { ...dto, userId });
    const saved = await this.notificationRepository.save(notification);
    return { success: true, message: 'Notification created', data: saved };
  }

  async findAll(
    userId: string,
    options?: {
      isRead?: boolean;
      type?: string;
      page?: number;
      limit?: number;
    },
  ): Promise<ServiceResponse<Notification[]>> {
    const query = this.notificationRepository
      .createQueryBuilder('notification')
      .where('notification.userId = :userId', { userId })
      .orderBy('notification.createdAt', 'DESC');

    if (options?.isRead !== undefined) {
      if (options.isRead) {
        query.andWhere('notification.readAt IS NOT NULL');
      } else {
        query.andWhere('notification.readAt IS NULL');
      }
    }
    if (options?.type)
      query.andWhere('notification.type = :type', { type: options.type });

    const page = options?.page || 1;
    const limit = options?.limit || 20;
    query.skip((page - 1) * limit).take(limit);

    const [notifications, total] = await query.getManyAndCount();
    return {
      success: true,
      message: 'Notifications retrieved',
      data: notifications,
      meta: { total, page, limit },
    };
  }

  async markAsRead(
    id: string,
    userId?: string,
  ): Promise<ServiceResponse<Notification>> {
    const notification = await this.notificationRepository.findOne({
      where: { id },
    });
    if (!notification) throw new NotFoundException('Notification not found');
    if (userId && notification.userId !== userId)
      throw new NotFoundException('Notification not found');
    notification.readAt = new Date();
    const updated = await this.notificationRepository.save(notification);
    return {
      success: true,
      message: 'Notification marked as read',
      data: updated,
    };
  }

  async markAllAsRead(userId: string): Promise<ServiceResponse<void>> {
    await this.notificationRepository.update(
      { userId, readAt: IsNull() },
      { readAt: new Date() },
    );
    return { success: true, message: 'All notifications marked as read' };
  }

  async remove(id: string, userId?: string): Promise<ServiceResponse<void>> {
    const notification = await this.notificationRepository.findOne({
      where: { id },
    });
    if (!notification) throw new NotFoundException('Notification not found');
    if (userId && notification.userId !== userId)
      throw new NotFoundException('Notification not found');
    await this.notificationRepository.remove(notification);
    return { success: true, message: 'Notification deleted' };
  }

  async getUnreadCount(userId: string): Promise<ServiceResponse<number>> {
    const count = await this.notificationRepository.count({
      where: { userId, readAt: IsNull() },
    });
    return { success: true, message: 'Unread count retrieved', data: count };
  }

  async getPreferences(
    userId: string,
  ): Promise<ServiceResponse<NotificationPreference[]>> {
    const prefs = await this.preferenceRepository.find({ where: { userId } });
    return { success: true, message: 'Preferences retrieved', data: prefs };
  }

  async updatePreference(
    userId: string,
    type: string,
    dto: any,
  ): Promise<ServiceResponse<NotificationPreference>> {
    let pref = await this.preferenceRepository.findOne({
      where: { userId, type: type as any },
    });
    if (!pref) {
      pref = new NotificationPreference();
      Object.assign(pref, { userId, type });
    }
    Object.assign(pref, dto);
    const saved = await this.preferenceRepository.save(pref);
    return { success: true, message: 'Preference updated', data: saved };
  }

  async getTemplates(): Promise<ServiceResponse<NotificationTemplate[]>> {
    const templates = await this.templateRepository.find({
      where: { isActive: true },
    });
    return { success: true, message: 'Templates retrieved', data: templates };
  }

  async createTemplate(
    dto: CreateNotificationTemplateDto,
  ): Promise<ServiceResponse<NotificationTemplate>> {
    const template = new NotificationTemplate();
    Object.assign(template, dto);
    const saved = await this.templateRepository.save(template);
    return { success: true, message: 'Template created', data: saved };
  }

  async updateTemplate(
    id: string,
    dto: UpdateNotificationTemplateDto,
  ): Promise<ServiceResponse<NotificationTemplate>> {
    const template = await this.templateRepository.findOne({ where: { id } });
    if (!template) throw new NotFoundException('Template not found');
    Object.assign(template, dto);
    const updated = await this.templateRepository.save(template);
    return { success: true, message: 'Template updated', data: updated };
  }

  async deleteTemplate(id: string): Promise<ServiceResponse<void>> {
    const template = await this.templateRepository.findOne({ where: { id } });
    if (!template) throw new NotFoundException('Template not found');
    await this.templateRepository.remove(template);
    return { success: true, message: 'Template deleted' };
  }
}
