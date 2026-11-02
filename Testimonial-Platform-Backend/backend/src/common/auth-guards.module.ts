import { Global, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserEntity } from '../user/entity/user.entity';
import { AdminEntity } from '../admin/entity/admin.entity';
import { UserAuthGuard } from '../user/auth/user.auth.guard';
import { AdminAuthGuard } from '../admin/auth/admin.auth.guard';
import { MailService } from './mail.service';

/** Makes both guards (and the mail service) usable from every module */
@Global()
@Module({
  imports: [TypeOrmModule.forFeature([UserEntity, AdminEntity])],
  providers: [UserAuthGuard, AdminAuthGuard, MailService],
  exports: [UserAuthGuard, AdminAuthGuard, MailService, TypeOrmModule],
})
export class AuthGuardsModule {}
