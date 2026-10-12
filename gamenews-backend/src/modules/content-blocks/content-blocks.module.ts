import { Module } from '@nestjs/common';
import { ContentBlocksController } from './content-blocks.controller.js';
import { ContentBlocksService } from './content-blocks.service.js';
import { ContentBlockEntity } from './entities/content-block.entity/content-block.entity.js';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
   imports: [
    TypeOrmModule.forFeature([ContentBlockEntity]),
  ],
  controllers: [ContentBlocksController],
  providers: [ContentBlocksService],
    exports: [
    TypeOrmModule,
    ContentBlocksService,
  ],
})
export class ContentBlocksModule {}
