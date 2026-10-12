import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToMany,
  JoinColumn,
} from 'typeorm';

import type { Relation } from 'typeorm';

import { UserEntity } from '../../../users/entities/user.entity/user.entity.js';
import { CategoryEntity } from '../../../categories/entities/category.entity/category.entity.js';
import { ContentBlockEntity } from '../../../content-blocks/entities/content-block.entity/content-block.entity.js';
import { CommentEntity } from '../../../comments/entities/comment.entity/comment.entity.js';
import { NewsTagEntity } from '../../../news-tags/entities/news-tag.entity/news-tag.entity.js';

@Entity('news')
export class NewsEntity {
  @PrimaryGeneratedColumn({
    name: 'news_id',
    type: 'bigint',
  })
  newsId: string;

  @Column({
    type: 'varchar',
    length: 255,
  })
  title: string;

  @Column({
    type: 'varchar',
    length: 300,
    unique: true,
  })
  slug: string;

  @Column({
    type: 'text',
    nullable: true,
  })
  summary: string | null;

  @Column({
    name: 'category_id',
    type: 'bigint',
  })
  categoryId: string;

  @Column({
    name: 'author_id',
    type: 'bigint',
  })
  authorId: string;

  @Column({
    name: 'reviewer_id',
    type: 'bigint',
    nullable: true,
  })
  reviewerId: string | null;

  @Column({
    type: 'text',
    nullable: true,
  })
  thumbnail: string | null;

  @Column({
    type: 'varchar',
    length: 20,
    default: 'draft',
  })
  status: string;

  @Column({
    type: 'bigint',
    default: 0,
  })
  views: string;

  @Column({
    name: 'published_at',
    type: 'timestamp',
    nullable: true,
  })
  publishedAt: Date | null;

  @Column({
    name: 'scheduled_at',
    type: 'timestamp',
    nullable: true,
  })
  scheduledAt: Date | null;

  @Column({
    name: 'editor_note',
    type: 'text',
    nullable: true,
  })
  editorNote: string | null;

  @Column({
    name: 'requirement_note',
    type: 'text',
    nullable: true,
  })
  requirementNote: string | null;

  @Column({
    name: 'review_score',
    type: 'numeric',
    precision: 3,
    scale: 1,
    nullable: true,
  })
  reviewScore: number | null;

  // =========================
  // CATEGORY
  // =========================

  @ManyToOne(() => CategoryEntity, (category) => category.news, {
    onUpdate: 'CASCADE',
    onDelete: 'RESTRICT',
  })
  @JoinColumn({
    name: 'category_id',
    referencedColumnName: 'categoryId',
  })
  category: Relation<CategoryEntity>;

  // =========================
  // AUTHOR
  // =========================

  @ManyToOne(() => UserEntity, (user) => user.authoredNews, {
    onUpdate: 'CASCADE',
    onDelete: 'RESTRICT',
  })
  @JoinColumn({
    name: 'author_id',
    referencedColumnName: 'userId',
  })
  author: Relation<UserEntity>;

  // =========================
  // REVIEWER
  // =========================

  @ManyToOne(() => UserEntity, (user) => user.reviewedNews, {
    nullable: true,
    onUpdate: 'CASCADE',
    onDelete: 'SET NULL',
  })
  @JoinColumn({
    name: 'reviewer_id',
    referencedColumnName: 'userId',
  })
  reviewer: Relation<UserEntity> | null;

  // =========================
  // CONTENT BLOCKS
  // =========================

  @OneToMany(
    () => ContentBlockEntity,
    (contentBlock) => contentBlock.news,
  )
  contentBlocks: Relation<ContentBlockEntity>[];

  // =========================
  // COMMENTS
  // =========================

  @OneToMany(() => CommentEntity, (comment) => comment.news)
  comments: Relation<CommentEntity>[];

  // =========================
  // TAGS
  // =========================

  @OneToMany(() => NewsTagEntity, (newsTag) => newsTag.news)
  newsTags: Relation<NewsTagEntity>[];
}