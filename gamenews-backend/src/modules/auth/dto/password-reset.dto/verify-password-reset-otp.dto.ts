
import {
  IsEmail,
  IsString,
  IsUUID,
  Length,
  MaxLength,
} from 'class-validator';

export class VerifyPasswordResetOtpDto {
  @IsEmail()
  @MaxLength(255)
  email: string;

  @IsString()
  @Length(6, 6)
  otp: string;

  @IsUUID()
  sessionId: string;
}