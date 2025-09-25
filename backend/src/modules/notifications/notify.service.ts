import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Notification } from './entities/notify.entity';
import { BaseI18nService } from '../shared/baseI18n.service';
import { I18nService } from 'nestjs-i18n';
import { RequestI18nContextService } from '@/common/context/i18nContext.service';
import { NotificationSerializer } from './serializers/notify.serializer';
import { plainToInstance } from 'class-transformer';


@Injectable()
export class NotificationService extends BaseI18nService {
  constructor(
    @InjectRepository(Notification)
    private readonly notificationRepo: Repository<Notification>,
    protected readonly i18n: I18nService,
    protected readonly context: RequestI18nContextService,
  ) {
    super(i18n, context);
  }

  async getUserNotifications(
    userId: number,
  ): Promise<NotificationSerializer[]> {
    try {
      const notifications = await this.notificationRepo.find({
        where: { user: { id: userId } },
        order: { createdAt: 'DESC' },
      });

      return plainToInstance(NotificationSerializer, notifications, {
        excludeExtraneousValues: true,
      });
    } catch (err) {
      throw new BadRequestException(await this.t('notifications.fetch_failed'));
    }
  }

  async markAsRead(
    userId: number,
    notificationId: number,
  ): Promise<NotificationSerializer> {
    try {
      const notification = await this.notificationRepo.findOne({
        where: { id: notificationId, user: { id: userId } },
      });

      if (!notification) {
        throw new NotFoundException(await this.t('notifications.not_found'));
      }

      notification.isRead = true;
      const updated = await this.notificationRepo.save(notification);

      return plainToInstance(NotificationSerializer, updated, {
        excludeExtraneousValues: true,
      });
    } catch (err) {
      if (err instanceof NotFoundException) throw err;
      throw new BadRequestException(
        await this.t('notifications.update_failed'),
      );
    }
  }

  async markAllAsRead(userId: number): Promise<{ message: string }> {
    try {
      await this.notificationRepo
        .createQueryBuilder()
        .update(Notification)
        .set({ isRead: true })
        .where('user_id = :userId', { userId })
        .execute();

      return {
        message: await this.t('notifications.mark_all_as_read_success'),
      };
    } catch (err) {
      throw new BadRequestException(
        await this.t('notifications.update_all_failed'),
      );
    }
  }
}
