

import { Match } from '../../validators/match.validator.js';
import { IsAccepted } from '../../validators/is-accepted.validator.js';
import { IsStrongPassword } from '../../validators/is-strong-password.validator.js';
import { IsUsername } from '../../validators/is-username.validator.js';
import { IsEmailAddress } from '../../validators/is-email.validator.js';

export class RegisterDto {
  @IsUsername()
  username: string;


  @IsEmailAddress()
  email: string;

  @IsStrongPassword()
  password: string;

 
  @Match('password')
  confirm: string;
@IsAccepted({
  message: 'Bạn phải đồng ý với điều khoản sử dụng',
})
terms: boolean;
;

}
