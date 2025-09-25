import { Controller, Get, Param, Post, UseGuards, Req } from '@nestjs/common';
import { NotificationService } from './notify.service';
import { NotificationSerializer } from './serializers/notify.serializer';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ApiTags } from '@nestjs/swagger';
import { ApiResponseData } from '@/common/interceptors/responseSwagger.interceptor';
import { MessageResponseDto } from '@/common/response/response_message';

@ApiTags('Notifications')
@Controller('notifications')
@UseGuards(JwtAuthGuard)
export class NotificationController {
  constructor(private readonly notificationService: NotificationService) {}

  @Get()
  @ApiResponseData(NotificationSerializer, true)
  async getUserNotifications(@Req() req): Promise<NotificationSerializer[]> {
    return this.notificationService.getUserNotifications(req.user.id);
  }

  @Post(':id/read')
  @ApiResponseData(NotificationSerializer)
  async markAsRead(
    @Req() req,
    @Param('id') notificationId: number,
  ): Promise<NotificationSerializer> {
    return this.notificationService.markAsRead(req.user.id, notificationId);
  }

  @Post('mark-all-read')
  @ApiResponseData(MessageResponseDto)
  async markAllAsRead(@Req() req): Promise<{ message: string }> {
    return this.notificationService.markAllAsRead(req.user.id);
  }
}
