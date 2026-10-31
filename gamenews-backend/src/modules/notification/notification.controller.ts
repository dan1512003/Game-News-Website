import {
  Controller,
  Get,
  Post,
  UseGuards,
} from '@nestjs/common';

import { NotificationService } from './notification.service.js';
import { NotificationGateway } from './notification.gateway.js';

import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard.js';
import { RolesGuard } from '../auth/guards/roles.guard.js';
import { Roles } from '../auth/decorators/roles.decorator.js';

import { CurrentUser } from '../../common/decorators/current-user.decorator.js';
import { UserEntity } from '../users/entities/user.entity/user.entity.js';

@Controller('notifications')
@UseGuards(JwtAuthGuard, RolesGuard)
export class NotificationController {
  constructor(
    private readonly notificationService: NotificationService,
    private readonly notificationGateway: NotificationGateway,
  ) {}

  // GET /notifications/recent
  // Lấy 20 hoạt động gần nhất trên Dashboard.
  @Get('recent')
  @Roles('admin', 'super_admin', 'editor','author')
  findRecent() {
    return this.notificationService.findRecent();
  }
// GET /notifications/daily-views
// Lấy thống kê lượt xem 30 ngày.
@Get('daily-views')
@Roles('admin', 'super_admin', 'editor', 'author')
getDailyViews() {
  return this.notificationService.getDailyViews();
}
  // POST /notifications/websocket-token
  // Tạo JWT riêng dành cho kết nối WebSocket.
  @Post('websocket-token')
  @Roles('admin', 'super_admin', 'editor','author')
  createWebSocketToken(
    @CurrentUser() user: UserEntity,
  ) {
    return this.notificationGateway.createWebSocketToken(user);
  }


}