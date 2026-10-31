import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  Index,
  Check,
} from 'typeorm';

export type NotificationType =
  | 'NEWS'
  | 'USER'
  | 'COMMENT';

@Entity('notifications')
@Index('idx_notifications_created_at', ['createdAt'])
@Check(
  'chk_notifications_type',
  `"type" IN ('NEWS', 'USER', 'COMMENT')`,
)
export class Notification {
  @PrimaryGeneratedColumn({ type: 'bigint' })
  id: string;

  @Column({
    type: 'varchar',
    length: 20,
  })
  type: NotificationType;

  @Column({ type: 'text' })
  message: string;

  @CreateDateColumn({
    name: 'created_at',
    type: 'timestamptz',
  })
  createdAt: Date;
}