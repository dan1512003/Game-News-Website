
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

import { TagsService } from './tags.service.js';

import { CreateTagDto } from './dto/create-tag.dto/create-tag.dto.js';
import { UpdateTagDto } from './dto/update-tag.dto/update-tag.dto.js';
import { QueryTagDto } from './dto/query-tag.dto/query-tag.dto.js';

import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard.js';
import { RolesGuard } from '../auth/guards/roles.guard.js';
import { Roles } from '../auth/decorators/roles.decorator.js';

@Controller('tags')
@UseGuards(JwtAuthGuard, RolesGuard)
export class TagsController {
  constructor(
    private readonly tagsService: TagsService,
  ) {}
  @Get('dashboard-stats') 
  @Roles('admin', 'super_admin', 'editor')
   getDashboardStats() { 
    return this.tagsService.getDashboardStats(); 
  }
  // Lấy toàn bộ tag dùng cho select / options
  @Get('options')
  findAllOptions() {
    return this.tagsService.findAllOptions();
  }

  // Danh sách tag: tìm kiếm + phân trang
  @Get()
  findAll(@Query() query: QueryTagDto) {
    return this.tagsService.findAll(query);
  }

  // Xem chi tiết tag
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.tagsService.findOne(id);
  }

  // Tạo tag
  @Post()
  @Roles('admin', 'super_admin', 'editor')
  create(@Body() dto: CreateTagDto) {
    return this.tagsService.create(dto);
  }

  // Sửa tag
  @Patch(':id')
  @Roles('admin', 'super_admin', 'editor')
  update(
    @Param('id') id: string,
    @Body() dto: UpdateTagDto,
  ) {
    return this.tagsService.update(id, dto);
  }

  // Xóa tag
  @Delete(':id')
  @Roles('admin', 'super_admin', 'editor')
  remove(@Param('id') id: string) {
    return this.tagsService.remove(id);
  }

}