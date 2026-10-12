import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  OneToMany,
  JoinColumn,
} from 'typeorm';

import type { Relation } from 'typeorm';

import { NewsEntity } from '../../../news/entities/news.entity/news.entity.js';
import { UserEntity } from '../../../users/entities/user.entity/user.entity.js';

@Entity('comments')
export class CommentEntity {
  @PrimaryGeneratedColumn({
    name: 'comment_id',
    type: 'bigint',
  })
  commentId: string;

  @Column({
    name: 'news_id',
    type: 'bigint',
  })
  newsId: string;

  @Column({
    name: 'user_id',
    type: 'bigint',
  })
  userId: string;

  @Column({
    name: 'parent_id',
    type: 'bigint',
    nullable: true,
  })
  parentId: string | null;

  @Column({
    type: 'text',
  })
  content: string;

  @Column({
    type: 'varchar',
    length: 20,
    default: 'pending',
  })
  status: string;

  @Column({
    type: 'integer',
    default: 0,
  })
  likes: number;

  @CreateDateColumn({
    name: 'created_at',
    type: 'timestamp',
  })
  createdAt: Date;

  // =========================
  // NEWS
  // =========================

  @ManyToOne(() => NewsEntity, (news) => news.comments, {
    onUpdate: 'CASCADE',
    onDelete: 'CASCADE',
  })
  @JoinColumn({
    name: 'news_id',
    referencedColumnName: 'newsId',
  })
  news: Relation<NewsEntity>;

  // =========================
  // USER
  // =========================

  @ManyToOne(() => UserEntity, (user) => user.comments, {
    onUpdate: 'CASCADE',
    onDelete: 'CASCADE',
  })
  @JoinColumn({
    name: 'user_id',
    referencedColumnName: 'userId',
  })
  user: Relation<UserEntity>;

  // =========================
  // PARENT COMMENT
  // =========================

  @ManyToOne(() => CommentEntity, (comment) => comment.replies, {
    nullable: true,
    onUpdate: 'CASCADE',
    onDelete: 'CASCADE',
  })
  @JoinColumn({
    name: 'parent_id',
    referencedColumnName: 'commentId',
  })
  parent: Relation<CommentEntity> | null;

  // Các comment trả lời comment này
  @OneToMany(() => CommentEntity, (comment) => comment.parent)
  replies: Relation<CommentEntity>[];
}