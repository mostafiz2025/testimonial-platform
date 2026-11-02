import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import * as bcrypt from 'bcrypt';
import { Repository } from 'typeorm';
import { AdminLoginDTO } from '../dto/admin.dto';
import { AdminEntity } from '../entity/admin.entity';

@Injectable()
export class AdminAuthService {
  constructor(
    @InjectRepository(AdminEntity) private admins: Repository<AdminEntity>,
    private jwtService: JwtService,
  ) {}

  async signIn(dto: AdminLoginDTO) {
    const admin = await this.admins.findOne({
      where: { email: dto.email.toLowerCase() },
      select: { id: true, name: true, email: true, password: true },
    });
    if (!admin || !(await bcrypt.compare(dto.password, admin.password)))
      throw new UnauthorizedException('Invalid e-mail or password');

    return {
      access_token: await this.jwtService.signAsync({
        sub: admin.id,
        email: admin.email,
        role: 'admin',
      }),
      admin: { id: admin.id, name: admin.name, email: admin.email },
    };
  }
}
