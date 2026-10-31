import {
  ExecutionContext,
  Injectable,
} from '@nestjs/common';

import { Reflector } from '@nestjs/core';
import { AuthGuard } from '@nestjs/passport';

import {
  IS_PUBLIC_KEY,
} from '../../../common/decorators/public.decorator.js';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  constructor(
    private readonly reflector: Reflector,
  ) {
    super();
  }

  async canActivate(
    context: ExecutionContext,
  ): Promise<boolean> {
    const isPublic = this.reflector.getAllAndOverride<boolean>(
      IS_PUBLIC_KEY,
      [
        context.getHandler(),
        context.getClass(),
      ],
    );

    const request = context.switchToHttp().getRequest();

    console.log('\n========== JWT AUTH GUARD ==========');
    console.log('[JWT] Method:', request.method);
    console.log('[JWT] URL:', request.url);
    console.log('[JWT] Is public:', isPublic);

    // Route không public: bắt buộc xác thực JWT.
    if (!isPublic) {
      return (await super.canActivate(context)) as boolean;
    }

    const authorization = request.headers.authorization;

    console.log(
      '[JWT] Authorization:',
      authorization ? 'Có token' : 'Không có token',
    );

   
    if (!authorization) {
      request.user = null;

      console.log('[JWT] Không có token, tiếp tục truy cập public');

      return true;
    }


    try {
      const result = await super.canActivate(context);

      console.log('[JWT] Passport result:', result);
      console.log('[JWT] Request user:', request.user);
      console.log('[JWT] Request userId:', request.user?.userId);

      return Boolean(result);
    } catch (error) {
      request.user = null;

      console.error('[JWT] Xác thực token thất bại:', error);

      return true;
    }
  }
}