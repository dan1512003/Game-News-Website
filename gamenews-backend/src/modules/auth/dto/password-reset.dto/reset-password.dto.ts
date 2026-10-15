import {
  IsEmail,
  IsString,
  MaxLength,
} from 'class-validator';
import { IsStrongPassword } from '../../validators/is-strong-password.validator.js';
import { Match } from '../../validators/match.validator.js';



export class ResetPasswordDto {
  @IsEmail({}, { message: 'Email không hợp lệ' })
  email: string;

  @IsString({ message: 'Mật khẩu mới phải là chuỗi ký tự' })
  @IsStrongPassword()
  newPassword: string;

  @IsString({ message: 'Vui lòng xác nhận mật khẩu mới' })
  @Match('newPassword')
  confirmPassword: string;
   @IsString({
    message: 'Session ID phải là chuỗi ký tự',
  })
  @MaxLength(
    100,
    {
      message: 'Session ID không hợp lệ',
    },
  )
  sessionId: string;

}