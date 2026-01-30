import {
  Controller,
  Get,
  Patch,
  Body,
  UseGuards,
  Delete,
  Param,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { NotificationsService } from './notifications.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { NotificationResponseDto } from './dto/notification-response.dto';
import { MarkReadDto } from './dto/mark-read.dto';

@ApiTags('notifications')
@Controller('notification')
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  @Get()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get notifications for current user' })
  @ApiResponse({
    status: 200,
    description: 'List of notifications',
    type: [NotificationResponseDto],
  })
  findMine(@CurrentUser() user: { userId: string; email: string }) {
    return this.notificationsService.findForUser(user.userId);
  }

  @Patch('updates')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Mark notifications as read' })
  @ApiResponse({
    status: 200,
    description: 'Notifications marked as read',
    schema: {
      example: {
        updatedCount: 3,
        message: 'Notifications marked as read',
      },
    },
  })
  markAsRead(
    @CurrentUser() user: { userId: string; email: string },
    @Body() body: MarkReadDto,
  ) {
    return this.notificationsService.markAsRead(user.userId, body.ids);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Delete a notification' })
  @ApiResponse({
    status: 200,
    description: 'Notification deleted',
    schema: { example: { message: 'Notification deleted successfully' } },
  })
  async remove(
    @CurrentUser() user: { userId: string; email: string },
    @Param('id') id: string,
  ) {
    await this.notificationsService.remove(user.userId, id);
    return { message: 'Notification deleted successfully' };
  }
}
