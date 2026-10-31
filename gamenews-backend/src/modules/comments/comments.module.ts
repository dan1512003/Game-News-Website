import { Module } from '@nestjs/common';
import { CommentsController } from './comments.controller.js';
import { CommentsService } from './comments.service.js';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CommentEntity } from './entities/comment.entity/comment.entity.js';
import { NewsEntity } from '../news/entities/news.entity/news.entity.js';
import { UserEntity } from '../users/entities/user.entity/user.entity.js';
import { CommentLikeEntity } from './entities/comment-like.entity/comment-like.entity.js';
import { NotificationModule } from '../notification/notification.module.js';

@Module({
    imports: [
    TypeOrmModule.forFeature([
       CommentEntity,
       CommentLikeEntity,
      NewsEntity,
      UserEntity,
    ]),
       NotificationModule,
  ],
  controllers: [CommentsController],
  providers: [CommentsService]
})
export class CommentsModule {}
