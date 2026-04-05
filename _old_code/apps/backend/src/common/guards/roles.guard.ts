import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY } from '../decorators/roles.decorator';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<string[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    // Không có @Roles() → cho phép tất cả (chỉ cần JWT hợp lệ)
    if (!requiredRoles || requiredRoles.length === 0) {
      return true;
    }

    const { user } = context.switchToHttp().getRequest();

    // JwtStrategy.validate() đã gán req.user = { userId, email, role }
    if (!user || !requiredRoles.includes(user.role)) {
      throw new ForbiddenException(
        'Bạn không có quyền truy cập tài nguyên này!',
      );
    }

    return true;
  }
}