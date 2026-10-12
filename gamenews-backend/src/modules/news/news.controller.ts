import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UploadedFile,
  UploadedFiles,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';

import { NewsService } from './news.service.js';

import { CreateNewsDto } from './dto/create-news.dto/create-news.dto.js';
import { UpdateNewsDto } from './dto/update-news.dto/update-news.dto.js';
import { QueryNewsDto } from './dto/query-news.dto/query-news.dto.js';
import {
  NewsNoteDto,
  ScheduleNewsDto,
} from './dto/news-action.dto/news-action.dto.js';

import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard.js';
import { RolesGuard } from '../auth/guards/roles.guard.js';
import { Roles } from '../auth/decorators/roles.decorator.js';
import { CurrentUser } from '../../common/decorators/current-user.decorator.js';

import type { UserEntity } from '../users/entities/user.entity/user.entity.js';

import { ParseFormDataInterceptor } from '../../common/interceptors/parse-form-data.interceptor.js';
import { AnyFilesInterceptor } from '@nestjs/platform-express';
import { createImageUploadOptions } from '../../common/upload/image-upload.config.js';

@Controller('news')
@UseGuards(JwtAuthGuard, RolesGuard)
export class NewsController {
  constructor(
    private readonly newsService: NewsService,
  ) {}

  
private attachContentBlockImages(
  dto: CreateNewsDto | UpdateNewsDto,
  files: Express.Multer.File[],
): void {
  if (!dto.contentBlocks?.length) return;

  const imageFiles = new Map<number, Express.Multer.File>();

  for (const file of files) {
    const match = /^image_(\d+)$/.exec(file.fieldname);

    if (match) {
      imageFiles.set(Number(match[1]), file);
    }
  }

  dto.contentBlocks = dto.contentBlocks.map((block) => {
    if (block.type !== 'image') return block;

    const file = imageFiles.get(Number(block.position));

    if (!file) return block;

    return {
      ...block,
      content: `/uploads/news/${file.filename}`,
    };
  });
}

   // =====================================================
  // DASHBOARD STATS
  // GET /news/dashboard-stats
  // =====================================================

  @Get('dashboard-stats')
  @Roles('admin', 'super_admin', 'editor')
  getDashboardStats() {
    return this.newsService.getDashboardStats();
  }
  // =====================================================
  // FIND ALL
  // GET /news
  // =====================================================

  @Get()
  findAll(
    @Query() query: QueryNewsDto,
    @CurrentUser() user: UserEntity,
  ) {
    return this.newsService.findAll(query, user);
  }

  // =====================================================
  // FIND ONE
  // GET /news/:id
  // =====================================================

  @Get(':id')
  findOne(
    @Param('id') id: string,
    @CurrentUser() user: UserEntity,
  ) {
    return this.newsService.findOne(id, user);
  }

  // =====================================================
  // CREATE
  // POST /news
  // =====================================================


@Post()
@Roles('admin', 'editor', 'author', 'super_admin')
@UseInterceptors(
  AnyFilesInterceptor(createImageUploadOptions('news', true)),
  ParseFormDataInterceptor,
)
create(
  @UploadedFiles() files: Express.Multer.File[],
  @Body() dto: CreateNewsDto,
  @CurrentUser() user: UserEntity,
) {
  const uploadedFiles = files ?? [];

  const thumbnailFile = uploadedFiles.find(
    (file) => file.fieldname === 'file',
  );

  dto.thumbnail = thumbnailFile
    ? `/uploads/news/${thumbnailFile.filename}`
    : dto.thumbnail || '';

  this.attachContentBlockImages(dto, uploadedFiles);

  return this.newsService.create(dto, user);
}

@Patch(':id')
@Roles('admin', 'editor', 'author', 'super_admin')
@UseInterceptors(
  AnyFilesInterceptor(createImageUploadOptions('news', true)),
  ParseFormDataInterceptor,
)
update(
  @Param('id') id: string,
  @UploadedFiles() files: Express.Multer.File[],
  @Body() dto: UpdateNewsDto,
  @CurrentUser() user: UserEntity,
) {
  const uploadedFiles = files ?? [];

  const thumbnailFile = uploadedFiles.find(
    (file) => file.fieldname === 'file',
  );

  if (thumbnailFile) {
    dto.thumbnail = `/uploads/news/${thumbnailFile.filename}`;
  }

  this.attachContentBlockImages(dto, uploadedFiles);

  return this.newsService.update(id, dto, user);
}

  // =====================================================
  // DELETE
  // DELETE /news/:id
  // =====================================================

  @Delete(':id')
  remove(
    @Param('id') id: string,
    @CurrentUser() user: UserEntity,
  ) {
    return this.newsService.remove(id, user);
  }

  // =====================================================
  // APPLY
  // POST /news/:id/apply
  // SUBMITTED -> PROCESSING
  // =====================================================

  @Post(':id/apply')
  @Roles('admin', 'editor','super_admin')
  apply(
    @Param('id') id: string,
    @CurrentUser() user: UserEntity,
  ) {
    return this.newsService.apply(id, user);
  }

  // =====================================================
  // PUBLISH
  // POST /news/:id/publish
  // =====================================================

  @Post(':id/publish')
  @Roles('admin', 'editor','super_admin')
  publish(
    @Param('id') id: string,
    @CurrentUser() user: UserEntity,
  ) {
    return this.newsService.publish(id, user);
  }

  // =====================================================
  // SUBMIT
  // POST /news/:id/submit
  // DRAFT / RETURNED -> SUBMITTED / PROCESSING
  // =====================================================

  @Post(':id/submit')
  submit(
    @Param('id') id: string,
    @CurrentUser() user: UserEntity,
  ) {
    return this.newsService.submit(id, user);
  }

  // =====================================================
  // UNSUBMIT
  // POST /news/:id/unsubmit
  // SUBMITTED -> DRAFT
  // =====================================================

  @Post(':id/unsubmit')
  @Roles('author')
  unsubmit(
    @Param('id') id: string,
    @CurrentUser() user: UserEntity,
  ) {
    return this.newsService.unsubmit(id, user);
  }

  // =====================================================
  // RETURN TO AUTHOR
  // POST /news/:id/return
  // PROCESSING -> RETURNED
  // =====================================================

  @Post(':id/return')
  @Roles('admin', 'editor','super_admin')
  returnToAuthor(
    @Param('id') id: string,
    @Body() dto: NewsNoteDto,
    @CurrentUser() user: UserEntity,
  ) {
    return this.newsService.returnToAuthor(
      id,
      dto.note,
      user,
    );
  }

  // =====================================================
  // REQUIRE EDIT
  // POST /news/:id/require-edit
  // =====================================================

  @Post(':id/require-edit')
  requireEdit(
    @Param('id') id: string,
    @Body() dto: NewsNoteDto,
    @CurrentUser() user: UserEntity,
  ) {
    return this.newsService.requireEdit(
      id,
      dto.note,
      user,
    );
  }

  // =====================================================
  // UNREQUIRE
  // DELETE REQUEST NOTE
  // POST /news/:id/unrequire
  // =====================================================

  @Post(':id/unrequire')
  unrequire(
    @Param('id') id: string,
    @CurrentUser() user: UserEntity,
  ) {
    return this.newsService.unrequire(id, user);
  }

  // =====================================================
  // SCHEDULE
  // POST /news/:id/schedule
  // =====================================================

  @Post(':id/schedule')
  @Roles('admin', 'editor','super_admin')
  schedule(
    @Param('id') id: string,
    @Body() dto: ScheduleNewsDto,
    @CurrentUser() user: UserEntity,
  ) {
    return this.newsService.schedule(
      id,
      dto.scheduledAt,
      user,
    );
  }

  // =====================================================
  // UNSCHEDULE
  // POST /news/:id/unschedule
  // SCHEDULED -> PROCESSING
  // =====================================================

  @Post(':id/unschedule')
  @Roles('admin', 'editor','super_admin')
  unschedule(
    @Param('id') id: string,
    @CurrentUser() user: UserEntity,
  ) {
    return this.newsService.unschedule(id, user);
  }

  // =====================================================
  // UNPUBLISH
  // POST /news/:id/unpublish
  // PUBLISHED -> PROCESSING
  // =====================================================

  @Post(':id/unpublish')
  @Roles('admin', 'editor','super_admin')
  unpublish(
    @Param('id') id: string,
    @CurrentUser() user: UserEntity,
  ) {
    return this.newsService.unpublish(id, user);
  }

}