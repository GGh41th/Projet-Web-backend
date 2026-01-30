import { Module } from '@nestjs/common';
import { NotificationService } from './notification.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Notification } from '../entities/notification.entity';
import { User } from '../entities/user.entity';

@Module({
  providers: [NotificationService],
  imports: [TypeOrmModule.forFeature([Notification, User])],
})
export class NotificationModule {}
