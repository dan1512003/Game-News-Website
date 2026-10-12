import {
  Entity,
  PrimaryColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';

import type { Relation } from 'typeorm';

import { NewsEntity } from '../../../news/entities/news.entity/news.entity.js';
import { TagEntity } from '../../../tags/entities/tag.entity/tag.entity.js';

@Entity('news_tags')
export class NewsTagEntity {
  @PrimaryColumn({
    name: 'news_id',
    type: 'bigint',
  })
  newsId: string;

  @PrimaryColumn({
    name: 'tag_id',
    type: 'bigint',
  })
  tagId: string;

  @ManyToOne(() => NewsEntity, (news) => news.newsTags, {
    onUpdate: 'CASCADE',
    onDelete: 'CASCADE',
  })
  @JoinColumn({
    name: 'news_id',
    referencedColumnName: 'newsId',
  })
  news: Relation<NewsEntity>;

  @ManyToOne(() => TagEntity, (tag) => tag.newsTags, {
    onUpdate: 'CASCADE',
    onDelete: 'CASCADE',
  })
  @JoinColumn({
    name: 'tag_id',
    referencedColumnName: 'tagId',
  })
  tag: Relation<TagEntity>;
}