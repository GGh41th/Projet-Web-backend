import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Notification } from '../entities/notification.entity';
import { NotificationResponseDto } from './dto/notification-response.dto';
import { NotificationType } from './enums/notification-type.enum';
import { NotificationTargetType } from './enums/notification-target.enum';
import { User } from '../entities/user.entity';
import { SocketGateway } from '../socket/socket.gateway';

type CreateNotificationInput = {
  recipientId: string;
  actorId: string;
  actorUsername?: string;
  type: NotificationType;
  targetType: NotificationTargetType;
  articleId?: string | null;
  commentId?: string | null;
};

@Injectable()
export class NotificationsService {
  constructor(
    @InjectRepository(Notification)
    private readonly notificationRepository: Repository<Notification>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly socketGateway: SocketGateway,
  ) {}

  async findForUser(recipientId: string): Promise<NotificationResponseDto[]> {
    const notifications = await this.notificationRepository
      .createQueryBuilder('notification')
      .leftJoin('notification.actor', 'actor')
      .select([
        'notification.id',
        'notification.type',
        'notification.targetType',
        'notification.articleId',
        'notification.commentId',
        'notification.isRead',
        'notification.createdAt',
        'actor.id',
        'actor.username',
      ])
      .where('notification.recipientId = :recipientId', { recipientId })
      .orderBy('notification.createdAt', 'DESC')
      .getMany();

    return notifications.map((notification) => this.toDto(notification));
  }

  async createNotification(
    input: CreateNotificationInput,
  ): Promise<NotificationResponseDto | null> {
    if (!input.recipientId || input.recipientId === input.actorId) {
      return null;
    }

    const notification = this.notificationRepository.create({
      recipientId: input.recipientId,
      actorId: input.actorId,
      type: input.type,
      targetType: input.targetType,
      articleId: input.articleId ?? null,
      commentId: input.commentId ?? null,
      isRead: false,
    });

    const saved = await this.notificationRepository.save(notification);

    const actor =
      input.actorUsername ||
      (await this.userRepository.findOne({
        where: { id: input.actorId },
        select: ['id', 'username'],
      }))?.username ||
      input.actorId;

    const dto = this.toDto(saved, {
      id: input.actorId,
      username: actor,
    });

    if (this.socketGateway) {
      this.socketGateway.emitNotification(input.recipientId, dto);
    }

    return dto;
  }

  async markAsRead(
    recipientId: string,
    ids: string[],
  ): Promise<{ updatedCount: number; message: string }> {
    if (!ids || ids.length === 0) {
      return { updatedCount: 0, message: 'No notifications updated' };
    }

    const result = await this.notificationRepository
      .createQueryBuilder()
      .update(Notification)
      .set({ isRead: true })
      .where('id IN (:...ids)', { ids })
      .andWhere('recipientId = :recipientId', { recipientId })
      .execute();

    return {
      updatedCount: result.affected || 0,
      message: 'Notifications marked as read',
    };
  }

  async remove(recipientId: string, id: string): Promise<void> {
    const result = await this.notificationRepository.delete({
      id,
      recipientId,
    });

    if (!result.affected) {
      throw new NotFoundException(`Notification with ID ${id} not found`);
    }
  }

  private toDto(
    notification: Notification,
    actor?: { id: string; username: string },
  ): NotificationResponseDto {
    const resolvedActor =
      actor ||
      (notification as any).actor || { id: notification.actorId, username: 'Unknown' };

    return {
      id: notification.id,
      type: notification.type,
      targetType: notification.targetType,
      actor: {
        id: resolvedActor.id,
        username: resolvedActor.username,
      },
      articleId: notification.articleId ?? null,
      commentId: notification.commentId ?? null,
      isRead: notification.isRead,
      createdAt: notification.createdAt,
    };
  }
}
