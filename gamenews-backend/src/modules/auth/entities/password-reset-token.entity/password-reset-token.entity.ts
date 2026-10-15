
import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,

} from 'typeorm';
import type { Relation } from 'typeorm';
import { UserEntity } from '../../../users/entities/user.entity/user.entity.js';



@Entity('password_reset_tokens')
export class PasswordResetTokenEntity {
  @PrimaryGeneratedColumn({ type: 'bigint' })
  id: string;

  @Column({ name: 'user_id', type: 'bigint' })
  userId: string;

  @Column({
    name: 'otp_hash',
    type: 'varchar',
    length: 255,
  })
  otpHash: string;

  
  @Column({
    name: 'expires_at',
    type: 'timestamptz',
  })
  expiresAt: Date;





  @Column({
    type: 'integer',
    default: 0,
  })
  attempts: number;

  @CreateDateColumn({
    name: 'created_at',
    type: 'timestamptz',
    default: () => 'NOW()',
  })
  createdAt: Date;
@Column({
  name: 'session_id',
  type: 'uuid',
})
sessionId: string;

@Column({
  name: 'reset_token_hash',
  type: 'varchar',
  length: 255,
  nullable: true,
})
resetTokenHash: string | null;



@Column({
  name: 'expire_reset_token_at',
  type: 'timestamptz',
  nullable: true,
})
expireResetTokenAt: Date | null;


  @JoinColumn({
    name: 'user_id',
    referencedColumnName: 'userId',
  })
  user: Relation<UserEntity>;


}