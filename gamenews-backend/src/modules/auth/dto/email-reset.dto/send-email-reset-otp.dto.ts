import {
  IsEmail,
  IsNotEmpty,
} from 'class-validator';

export class SendEmailResetOtpDto {
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
  emailNew: string;
}