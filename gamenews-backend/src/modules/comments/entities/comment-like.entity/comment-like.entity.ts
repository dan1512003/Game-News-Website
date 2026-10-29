import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  Unique,
  Index,
} from 'typeorm';

@Entity('comment_likes')
@Unique('uq_comment_likes_user_comment', [
  'commentId',
  'userId',
])
@Index('idx_comment_likes_user_id', ['userId'])
@Index('idx_comment_likes_comment_id', ['commentId'])
export class CommentLikeEntity {
  @PrimaryGeneratedColumn('identity', {
    type: 'bigint',
  })
  id: string;

  @Column({
    name: 'comment_id',
    type: 'bigint',
  })
  commentId: string;

  @Column({
    name: 'user_id',
    type: 'bigint',
  })
  userId: string;

  @CreateDateColumn({
    name: 'created_at',
    type: 'timestamptz',
    default: () => 'NOW()',
  })
  createdAt: Date;
}