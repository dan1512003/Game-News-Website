
import {
  Entity,
  PrimaryColumn,
  Column,
  CreateDateColumn,
  Index,
} from 'typeorm';

@Entity('access_token_blacklist')
export class AccessTokenBlacklistEntity {
  @PrimaryColumn({ type: 'uuid' })
  jti: string;

  @Index('idx_access_token_blacklist_expires_at')
  @Column({
    name: 'expires_at',
    type: 'timestamptz',
  })
  expiresAt: Date;

  @CreateDateColumn({
    name: 'created_at',
    type: 'timestamptz',
  })
  createdAt: Date;
}