import {
  Injectable,
} from '@nestjs/common';

import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { NotificationGateway } from './notification.gateway.js';
import { DailyViews, DashboardActivity, NotificationType } from './notification.types.js';
import { Notification } from './entities/notification.entity.js';


@Injectable()
export class NotificationService {
  constructor(
    @InjectRepository(Notification)
    private readonly notificationRepository: Repository<Notification>,

    private readonly notificationGateway: NotificationGateway,
  ) {}
  // ============================================================
  // CẬP NHẬT THỐNG KÊ LƯỢT XEM VÀ GỬI REALTIME
  // ============================================================

  async updateDailyViews(): Promise<void> {
    // Gửi lại thống kê 30 ngày đến tất cả Dashboard.
    await this.notificationGateway.emitDailyViews();
  }
async getDailyViews(): Promise<DailyViews[]> {
  return this.notificationGateway.getDailyViewsLast30Days();
}
  async createActivity(
    type: NotificationType,
    message: string,
  ): Promise<DashboardActivity> {
    // 1. Tạo dữ liệu
    const notification =
      this.notificationRepository.create({
        type,
        message,
      });

    // 2. Lưu database
    const saved =
      await this.notificationRepository.save(notification);

    // 3. Chuyển thành dữ liệu gửi cho Angular
    const activity: DashboardActivity = {
      id: saved.id,
      type: saved.type,
      message: saved.message,
      createdAt: saved.createdAt,
    };

    // 4. Gửi trực tiếp đến Dashboard
    this.notificationGateway.sendActivity(activity);

    return activity;
  }

  // Lấy 20 hoạt động gần nhất khi mở Dashboard
  async findRecent(): Promise<DashboardActivity[]> {
    const notifications =
      await this.notificationRepository.find({
        order: {
          createdAt: 'DESC',
        },
        take: 20,
      });

    return notifications.map((item) => ({
      id: item.id,
      type: item.type,
      message: item.message,
      createdAt: item.createdAt,
    }));
  }
}