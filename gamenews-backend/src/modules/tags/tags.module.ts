import { Module } from '@nestjs/common';
import { TagsController } from './tags.controller.js';
import { TagsService } from './tags.service.js';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TagEntity } from './entities/tag.entity/tag.entity.js';

@Module({
    imports: [
    TypeOrmModule.forFeature([TagEntity]),
  ],
  controllers: [TagsController],
  providers: [TagsService],
    exports: [
    TypeOrmModule,
    TagsService,
  ],
})

export class TagsModule {}
