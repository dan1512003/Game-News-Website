import { Module } from '@nestjs/common';
import { UsersController } from './users.controller.js';
import { UsersService } from './users.service.js';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserEntity } from './entities/user.entity/user.entity.js';
import { NotificationModule } from '../notification/notification.module.js';

@Module({
   imports: [
    TypeOrmModule.forFeature([UserEntity]),
       NotificationModule,
  ],
  controllers: [UsersController],
  providers: [UsersService],
  exports: [
    TypeOrmModule,
    UsersService,
  ],
})
export class UsersModule {}
