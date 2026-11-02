import { createParamDecorator, ExecutionContext } from '@nestjs/common';

/** Returns the logged-in user's id (JWT "sub") */
export const CurrentUserId = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext): number => {
    return ctx.switchToHttp().getRequest().user.sub;
  },
);
