import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AdminEntity } from '../entity/admin.entity';
import { AdminAuthController } from './admin.auth.controller';
import { AdminAuthService } from './admin.auth.service';

@Module({
  imports: [TypeOrmModule.forFeature([AdminEntity])],
  controllers: [AdminAuthController],
  providers: [AdminAuthService],
  exports: [AdminAuthService],
})
export class AdminAuthModule {}
