import { Body, Controller, Post } from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import { AdminLoginDTO } from '../dto/admin.dto';
import { AdminAuthService } from './admin.auth.service';

@Controller('admin-auth')
export class AdminAuthController {
  constructor(private adminAuthService: AdminAuthService) {}

  // POST http://localhost:7000/admin-auth/login
  @Throttle({ default: { limit: 10, ttl: 60_000 } })
  @Post('login')
  login(@Body() dto: AdminLoginDTO) {
    return this.adminAuthService.signIn(dto);
  }
}
