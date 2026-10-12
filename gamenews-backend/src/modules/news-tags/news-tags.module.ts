import { Module } from '@nestjs/common';
import { NewsTagsController } from './news-tags.controller.js';
import { NewsTagsService } from './news-tags.service.js';
import { NewsTagEntity } from './entities/news-tag.entity/news-tag.entity.js';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
    imports: [
    TypeOrmModule.forFeature([NewsTagEntity]),
  ],
  controllers: [NewsTagsController],
  providers: [NewsTagsService],
   exports: [
    TypeOrmModule,
    NewsTagsService,
  ],
})
export class NewsTagsModule {}
