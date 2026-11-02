import { Body, Controller, Post } from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import { LoginDTO, UserDTO } from '../dto/user.dto';
import { UserAuthService } from './user.auth.service';

@Controller('user-auth')
export class UserAuthController {
  constructor(private userAuthService: UserAuthService) {}

  // POST http://localhost:7000/user-auth/register
  @Throttle({ default: { limit: 10, ttl: 60_000 } })
  @Post('register')
  register(@Body() dto: UserDTO) {
    return this.userAuthService.signUp(dto);
  }

  // POST http://localhost:7000/user-auth/login
  @Throttle({ default: { limit: 10, ttl: 60_000 } })
  @Post('login')
  login(@Body() dto: LoginDTO) {
    return this.userAuthService.signIn(dto);
  }
}
