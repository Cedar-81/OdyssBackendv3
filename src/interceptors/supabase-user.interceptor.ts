import { Injectable, NestInterceptor, ExecutionContext, CallHandler, UnauthorizedException } from '@nestjs/common';
import { Observable } from 'rxjs';
import { UsersService } from '../users/users.service';

@Injectable()
export class SupabaseUserInterceptor implements NestInterceptor {
  constructor(private readonly usersService: UsersService) {}

  async intercept(context: ExecutionContext, next: CallHandler): Promise<Observable<any>> {
    const req = context.switchToHttp().getRequest();
    const clerkUser = req.user; // Clerk user from Passport strategy

    console.log('clerkUser: ', clerkUser);

    if (!clerkUser || !clerkUser.id || !clerkUser.emailAddresses) {
      throw new UnauthorizedException('Invalid Clerk user');
    }

    const clerkUserId = clerkUser.id;
    const email = clerkUser.emailAddresses[0].emailAddress;

    const supabaseUser = await this.usersService.getOrCreateByClerkId(clerkUserId, email);
    req['supabaseUser'] = supabaseUser;

    return next.handle();
  }
} 