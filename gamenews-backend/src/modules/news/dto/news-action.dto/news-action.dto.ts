import { IsDateString, IsString, MinLength } from 'class-validator';

export class NewsNoteDto {
  @IsString()
  @MinLength(1)
  note: string;
}

export class ScheduleNewsDto {
  @IsDateString()
  scheduledAt: string;
}