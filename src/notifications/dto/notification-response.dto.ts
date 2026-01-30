import { ApiProperty } from '@nestjs/swagger';
import { NotificationType } from '../enums/notification-type.enum';
import { NotificationTargetType } from '../enums/notification-target.enum';

export class NotificationActorDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  username: string;
}

export class NotificationResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty({ enum: NotificationType })
  type: NotificationType;

  @ApiProperty({ enum: NotificationTargetType })
  targetType: NotificationTargetType;

  @ApiProperty({ type: NotificationActorDto })
  actor: NotificationActorDto;

  @ApiProperty({ nullable: true })
  articleId: string | null;

  @ApiProperty({ nullable: true })
  commentId: string | null;

  @ApiProperty()
  isRead: boolean;

  @ApiProperty()
  createdAt: Date;
}
