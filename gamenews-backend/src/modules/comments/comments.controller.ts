import {
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Query,
  UseGuards,
} from '@nestjs/common';

import { CommentsService } from './comments.service.js';
import { QueryCommentsDto } from './dto/query-comments.dto/query-comments.dto.js';

import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard.js';
import { RolesGuard } from '../auth/guards/roles.guard.js';
import { Roles } from '../auth/decorators/roles.decorator.js';

@Controller('comments')
@UseGuards(JwtAuthGuard, RolesGuard)
export class CommentsController {
  constructor(
    private readonly commentsService: CommentsService,
  ) {}
 // =====================================================
  // DASHBOARD STATS
  // GET /comments/dashboard-stats
  // =====================================================

  @Get('dashboard-stats')
  @Roles('admin', 'editor', 'super_admin')
  getDashboardStats() {
    return this.commentsService.getDashboardStats();
  }

  /**
   * GET /comments
   */
  @Get()
  @Roles('admin', 'editor', 'author','super_admin')
  findAll(@Query() query: QueryCommentsDto) {
    return this.commentsService.findAll(query);
  }

  /**
   * GET /comments/:id
   */
  @Get(':id')
  @Roles('admin', 'editor', 'author','super_admin')
  findOne(@Param('id') id: string) {
    return this.commentsService.findOne(id);
  }

  /**
   * GET /comments/:id/parent
   */
  @Get(':id/parent')
  @Roles('admin', 'editor', 'author','super_admin')
  findParent(@Param('id') id: string) {
    return this.commentsService.findParent(id);
  }

  /**
   * PATCH /comments/:id/approve
   * Duyệt bình luận hợp lệ.
   */
  @Patch(':id/approve')
  @Roles('admin', 'editor','super_admin')
  approve(@Param('id') id: string) {
    return this.commentsService.approve(id);
  }

  /**
   * PATCH /comments/:id/reject
   * Từ chối bình luận không hợp lệ.
   */
  @Patch(':id/reject')
  @Roles('admin', 'editor','super_admin')
  reject(@Param('id') id: string) {
    return this.commentsService.reject(id);
  }

  /**
   * DELETE /comments/:id
   */
  @Delete(':id')
  @Roles('admin','super_admin')
  remove(@Param('id') id: string) {
    return this.commentsService.remove(id);
  }

 

}