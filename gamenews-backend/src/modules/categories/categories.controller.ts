
import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';

import { CategoriesService } from './categories.service.js';
import { CreateCategoryDto } from './dto/create-category.dto/create-category.dto.js';
import { UpdateCategoryDto } from './dto/update-category.dto/update-category.dto.js';
import { QueryCategoryDto } from './dto/query-category.dto/query-category.dto.js';

import { RolesGuard } from '../auth/guards/roles.guard.js';
import { Roles } from '../auth/decorators/roles.decorator.js';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard.js';

@Controller('categories')
@UseGuards(JwtAuthGuard, RolesGuard)
export class CategoriesController {
  constructor(
    private readonly categoriesService: CategoriesService,
  ) {}
  // =====================================================
  //  // DASHBOARD STATS 
  // // GET /categories/dashboard-stats
  //  // ===================================================== 
  @Get('dashboard-stats') 
  @Roles('admin', 'super_admin', 'editor')
   getDashboardStats()
    { return this.categoriesService.getDashboardStats(); }
    
  // Lấy danh sách danh mục có phân trang, tìm kiếm
  @Get()
  findAll(@Query() query: QueryCategoryDto) {
    return this.categoriesService.findAll(query);
  }

  // Lấy danh sách danh mục chỉ gồm ID và tên
  @Get('options')
  findAllOptions() {
    return this.categoriesService.findAllOptions();
  }

  // Lấy chi tiết một danh mục
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.categoriesService.findOne(id);
  }

  // Tạo danh mục
  @Post()
  @Roles('super_admin', 'admin', 'editor','super_admin')
  create(@Body() dto: CreateCategoryDto) {
    return this.categoriesService.create(dto);
  }

  // Cập nhật danh mục
  @Patch(':id')
  @Roles('super_admin', 'admin', 'editor','super_admin')
  update(
    @Param('id') id: string,
    @Body() dto: UpdateCategoryDto,
  ) {
    return this.categoriesService.update(id, dto);
  }

  // Xóa danh mục
  @Delete(':id')
  @Roles('super_admin', 'admin', 'editor','super_admin')
  remove(@Param('id') id: string) {
    return this.categoriesService.remove(id);
  }

}

