
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  Index,
  Check,
} from 'typeorm';

import type { Relation } from 'typeorm';

import { NewsEntity } from '../../../news/entities/news.entity/news.entity.js';

export type ContentBlockType =
  | 'paragraph'
  | 'heading1'
  | 'heading2'
  | 'image'
  | 'video'
  | 'quote';

@Entity('content_blocks')
@Index(['newsId', 'position'], {
  unique: true,
})
@Check(
  'CHK_content_blocks_type',
  `"type" IN ('paragraph', 'heading1', 'heading2', 'image', 'video', 'quote')`,
)
export class ContentBlockEntity {
  @PrimaryGeneratedColumn({
    name: 'block_id',
    type: 'bigint',
  })
  blockId: string;

  @Column({
    name: 'news_id',
    type: 'bigint',
  })
  newsId: string;

@Column({
  type: 'varchar',
  length: 30,
})
type: ContentBlockType;

  @Column({
    type: 'text',
  })
  content: string;

  @Column({
    type: 'integer',
  })
  position: number;

  @ManyToOne(() => NewsEntity, (news) => news.contentBlocks, {
    onUpdate: 'CASCADE',
    onDelete: 'CASCADE',
  })
  @JoinColumn({
    name: 'news_id',
    referencedColumnName: 'newsId',
  })
  news: Relation<NewsEntity>;
}

