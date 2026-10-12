import { Module } from '@nestjs/common';
import { CommentsController } from './comments.controller.js';
import { CommentsService } from './comments.service.js';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CommentEntity } from './entities/comment.entity/comment.entity.js';

@Module({
    imports: [
    TypeOrmModule.forFeature([CommentEntity]),
  ],
  controllers: [CommentsController],
  providers: [CommentsService]
})
export class CommentsModule {}
