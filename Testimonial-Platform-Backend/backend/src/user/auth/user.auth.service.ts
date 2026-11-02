import {
  ConflictException,
  ForbiddenException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import * as bcrypt from 'bcrypt';
import { Repository } from 'typeorm';
import { LoginDTO, UserDTO } from '../dto/user.dto';
import { UserEntity } from '../entity/user.entity';

@Injectable()
export class UserAuthService {
  constructor(
    @InjectRepository(UserEntity) private users: Repository<UserEntity>,
    private jwtService: JwtService,
  ) {}

  async signUp(dto: UserDTO) {
    const email = dto.email.toLowerCase();
    const exists = await this.users.findOne({ where: { email } });
    if (exists) throw new ConflictException('This e-mail is already registered');

    const user = this.users.create({
      name: dto.name.trim(),
      email,
      company: dto.company?.trim() || null,
      password: await bcrypt.hash(dto.password, await bcrypt.genSalt()),
    });
    const saved = await this.users.save(user);
    return this.buildSession(saved);
  }

  async signIn(dto: LoginDTO) {
    const user = await this.users.findOne({
      where: { email: dto.email.toLowerCase() },
      select: {
        id: true,
        name: true,
        email: true,
        password: true,
        profile_image: true,
        company: true,
        is_banned: true,
      },
    });
    if (!user || !(await bcrypt.compare(dto.password, user.password)))
      throw new UnauthorizedException('Invalid e-mail or password');
    if (user.is_banned) throw new ForbiddenException('Your account is banned');
    return this.buildSession(user);
  }

  private async buildSession(user: UserEntity) {
    const access_token = await this.jwtService.signAsync({
      sub: user.id,
      email: user.email,
      role: 'user',
    });
    return {
      access_token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        company: user.company,
        profile_image: user.profile_image,
      },
    };
  }
}
