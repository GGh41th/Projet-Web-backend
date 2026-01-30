import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Notification } from '../entities/notification.entity';
import { User } from '../entities/user.entity';

@Injectable()
export class NotificationService {
  constructor(
    @InjectRepository(Notification)
    private notificationRepository: Repository<Notification>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  async create(data: Partial<Notification>): Promise<Notification> {
    const notification = this.notificationRepository.create(data);
    return this.notificationRepository.save(notification);
  }

  async findAll(page = 1, limit = 10): Promise<{ data: Notification[]; total: number }> {
    const [data, total] = await this.notificationRepository
      .createQueryBuilder('notification')
      .leftJoinAndSelect('notification.recipient', 'recipient')
      .leftJoinAndSelect('notification.sender', 'sender')
      .orderBy('notification.createdAt', 'DESC')
      .skip((page - 1) * limit)
      .take(limit)
      .getManyAndCount();
    return { data, total };
  }

  async findOne(id: string): Promise<Notification> {
    const notification = await this.notificationRepository.findOne({
      where: { id },
      relations: ['recipient', 'sender'],
    });
    if (!notification) throw new NotFoundException('Notification not found');
    return notification;
  }

  async update(id: string, updateData: Partial<Notification>): Promise<Notification> {
    await this.notificationRepository.update(id, updateData);
    return this.findOne(id);
  }

  async remove(id: string): Promise<void> {
    const result = await this.notificationRepository.delete(id);
    if (result.affected === 0) throw new NotFoundException('Notification not found');
  }
}