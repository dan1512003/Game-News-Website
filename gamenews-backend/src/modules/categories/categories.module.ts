import { Module } from '@nestjs/common';
import { CategoriesController } from './categories.controller.js';
import { CategoriesService } from './categories.service.js';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CategoryEntity } from './entities/category.entity/category.entity.js';

@Module({
    imports: [
    TypeOrmModule.forFeature([CategoryEntity]),
  ],
  controllers: [CategoriesController],
  providers: [CategoriesService],
    exports: [
    TypeOrmModule,
    CategoriesService,
  ],
})
export class CategoriesModule {}
