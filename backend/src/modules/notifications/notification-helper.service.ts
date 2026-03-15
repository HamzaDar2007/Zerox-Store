import { Injectable } from '@nestjs/common';
import { NotificationsService } from './notifications.service';
import {
  NotificationTemplates,
  NotificationTemplate,
  renderTemplate,
} from './notification-templates';

@Injectable()
export class NotificationHelperService {
  constructor(private readonly notificationsService: NotificationsService) {}

  /**
   * Send a notification using a predefined template key.
   * @param userId - target user ID
   * @param templateKey - key from NotificationTemplates (e.g. 'ORDER_PLACED')
   * @param data - variables to interpolate into the template
   * @param extra - optional overrides (metadata, channel, etc.)
   */
  async notify(
    userId: string,
    templateKey: string,
    data: Record<string, string | number> = {},
    extra?: { metadata?: Record<string, any> },
  ) {
    const template: NotificationTemplate | undefined =
      NotificationTemplates[templateKey];
    if (!template) return;

    const rendered = renderTemplate(template, data);

    return this.notificationsService.create(userId, {
      channel: rendered.channel,
      type: rendered.type,
      title: rendered.title,
      body: rendered.body,
      actionUrl: rendered.actionUrl,
      sentAt: new Date(),
      metadata: extra?.metadata ?? null,
    });
  }

  /**
   * Send a notification to multiple users with the same template.
   */
  async notifyMany(
    userIds: string[],
    templateKey: string,
    data: Record<string, string | number> = {},
    extra?: { metadata?: Record<string, any> },
  ) {
    const promises = userIds.map((uid) =>
      this.notify(uid, templateKey, data, extra),
    );
    return Promise.allSettled(promises);
  }
}
