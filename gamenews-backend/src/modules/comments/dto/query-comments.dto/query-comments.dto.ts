import { Transform, Type } from 'class-transformer';
import {
  IsIn,
  IsInt,
  IsOptional,
  IsString,
  Max,
  MaxLength,
  Min,
} from 'class-validator';

export const COMMENT_STATUSES = [
  'pending',
  'approved',
  'spam',
] as const;

export class QueryCommentsDto {
  @IsOptional()
  @Transform(({ value }) =>
    typeof value === 'string' ? value.trim() : value,
  )
  @IsString()
  @MaxLength(255)
  search?: string;

  @IsOptional()
  @IsIn(COMMENT_STATUSES)
  status?: (typeof COMMENT_STATUSES)[number];

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page = 1;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit = 10;

  @IsOptional()
  @IsString()
  @MaxLength(20)
  newsId?: string;

  @IsOptional()
  @IsString()
  @MaxLength(20)
  userId?: string;
}