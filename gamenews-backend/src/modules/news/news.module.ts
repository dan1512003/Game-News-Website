import { Module } from '@nestjs/common';
import { NewsController } from './news.controller.js';
import { NewsService } from './news.service.js';
import { NewsEntity } from './entities/news.entity/news.entity.js';
import { TypeOrmModule } from '@nestjs/typeorm';
import { NewsTagEntity } from '../news-tags/entities/news-tag.entity/news-tag.entity.js';
import { ContentBlockEntity } from '../content-blocks/entities/content-block.entity/content-block.entity.js';

@Module({
    imports: [
    TypeOrmModule.forFeature([

      NewsEntity,
      NewsTagEntity,
      ContentBlockEntity,
    ]),
  ],
  controllers: [NewsController],
  providers: [NewsService],
    exports: [
    TypeOrmModule,
    NewsService,
  ],
})
export class NewsModule {}
