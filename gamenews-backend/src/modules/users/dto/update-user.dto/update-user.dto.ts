
import { IsIn } from 'class-validator';
import {
  USER_ROLES,
  USER_STATUSES,
} from '../query-users.dto/query-users.dto.js';

export class UpdateUserDto {
  @IsIn(USER_ROLES)
  role: (typeof USER_ROLES)[number];

  @IsIn(USER_STATUSES)
  status: (typeof USER_STATUSES)[number];
}