
import {
  IsArray,
  IsIn,
  IsInt,
  IsNumber,
  IsOptional,
  IsString,
  MaxLength,
  Min,
  MinLength,
  ValidateNested,
} from 'class-validator';

import { Type } from 'class-transformer';
import type { ContentBlockType } from '../../../content-blocks/entities/content-block.entity/content-block.entity.js';

export class CreateContentBlockDto {
  @IsString()
  @IsIn([
   'paragraph',
  'heading1',
  'heading2',
  'image',
   'video',
   'quote'
  ])
  type: ContentBlockType;

  @IsString()
  content: string;

  @Type(() => Number)
  @IsInt()
  @Min(0)
  position: number;
}

export class CreateNewsDto {
  @IsString()
  @MinLength(1)
  @MaxLength(255)
  title: string;

  @IsString()
  @MinLength(1)
  @MaxLength(300)
  slug: string;

  @IsOptional()
  @IsString()
  summary?: string | null;

  @Type(() => Number)
  @IsInt()
  @Min(1)
  categoryId: number;

  @IsOptional()
  @IsString()
  thumbnail?: string | null;

  @IsOptional()
  @IsIn([
    'draft',
    'submitted',
    'processing',
    'returned',
    'scheduled',
    'published',
  ])
  status?:
    | 'draft'
    | 'submitted'
    | 'processing'
    | 'returned'
    | 'scheduled'
    | 'published';

  @IsOptional()
  @IsArray()
  @Type(() => Number)
  @IsInt({ each: true })
  @Min(1, { each: true })
  tagIds?: number[];

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateContentBlockDto)
  contentBlocks?: CreateContentBlockDto[];

  @IsOptional()
  @IsString()
  reviewerId?: string | null;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  views?: number;

  @IsOptional()
  publishedAt?: Date | string | null;

  @IsOptional()
  scheduledAt?: Date | string | null;

  @IsOptional()
  @IsString()
  editorNote?: string | null;

  @IsOptional()
  @IsString()
  requirementNote?: string | null;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  reviewScore?: number | null;
}

