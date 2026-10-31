
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  Index,
  ManyToOne,
  JoinColumn,
} from 'typeorm';


import { UserEntity } from '../../users/entities/user.entity/user.entity.js';
import { NewsEntity } from '../../news/entities/news.entity/news.entity.js';

@Entity('news_views')
@Index('idx_news_views_news_id', ['newsId'])
@Index('idx_news_views_user_id', ['userId'])
@Index('idx_news_views_viewed_at', ['viewedAt'])
export class NewsView {
  @PrimaryGeneratedColumn({
    type: 'bigint',
    name: 'id',
  })
  id: string;

  @Column({
    name: 'news_id',
    type: 'bigint',
  })
  newsId: string;

  @Column({
    name: 'user_id',
    type: 'bigint',
    nullable: true,
  })
  userId: string | null;


  @CreateDateColumn({
    name: 'viewed_at',
    type: 'timestamptz',
    default: () => 'CURRENT_TIMESTAMP',
  })
  viewedAt: Date;

  // Quan hệ với bảng news.
  @ManyToOne(
    () => NewsEntity,
    {
      onDelete: 'CASCADE',
    },
  )
  @JoinColumn({
    name: 'news_id',
    referencedColumnName: 'newsId',
  })
  news: NewsEntity;

  // Quan hệ với bảng users.
  @ManyToOne(
    () => UserEntity,
    {
      nullable: true,
      onDelete: 'SET NULL',
    },
  )
  @JoinColumn({
    name: 'user_id',
    referencedColumnName: 'userId',
  })
  user: UserEntity | null;
}
