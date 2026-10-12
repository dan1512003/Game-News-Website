import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';

import { Reflector } from '@nestjs/core';
import { ROLES_KEY, UserRole } from '../decorators/roles.decorator.js';
interface AuthenticatedRequest {
  method: string;
  url: string;

  user?: {
    role?: UserRole;
    roles?: UserRole[];
  };
}

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

 canActivate(context: ExecutionContext): boolean {
  const requiredRoles = this.reflector.getAllAndOverride<UserRole[]>(
    ROLES_KEY,
    [context.getHandler(), context.getClass()],
  );

  const request = context
    .switchToHttp()
    .getRequest<AuthenticatedRequest>();

  const user = request.user;



  if (!requiredRoles?.length) {
   
    return true;
  }

  if (!user) {

    throw new ForbiddenException(
      'Không có thông tin người dùng',
    );
  }

  const userRoles = user.roles ?? (user.role ? [user.role] : []);

  const allowed = requiredRoles.some((role) =>
    userRoles.includes(role),
  );



  if (!allowed) {
  

    throw new ForbiddenException(
      'Bạn không có quyền thực hiện thao tác này',
    );
  }



  return true;
}
}