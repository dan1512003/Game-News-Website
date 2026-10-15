
import {
  IsEmail,
  IsNotEmpty,
  IsString,
  IsUUID,
  Matches,
  MaxLength,
} from 'class-validator';

export class ResetEmailDto {
  @IsEmail(
    {},
    {
      message: 'Email không hợp lệ',
    },
  )
  @IsNotEmpty({
    message: 'Email mới không được để trống',
  })
  email: string;
  @IsEmail(
    {},
    {
      message: 'Email không hợp lệ',
    },
  )
  @IsNotEmpty({
    message: 'Email mới không được để trống',
  })
  newEmail: string;

  @IsString({
    message: 'OTP phải là chuỗi',
  })

  @Matches(/^\d{6}$/, {
    message: 'OTP phải gồm đúng 6 chữ số',
  })
  otp: string;
   // =========================================
  // SESSION ID CỦA LẦN ĐỔI EMAIL
  // =========================================

  @IsUUID('4', {
    message: 'Session ID không hợp lệ',
  })
  @IsNotEmpty({
    message: 'Session ID không được để trống',
  })
  sessionId: string;
}