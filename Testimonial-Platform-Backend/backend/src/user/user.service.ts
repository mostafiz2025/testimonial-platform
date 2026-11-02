import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import * as bcrypt from 'bcrypt';
import { Repository } from 'typeorm';
import { removeUpload } from '../common/upload.util';
import { SpaceEntity } from '../space/entity/space.entity';
import { TestimonialEntity } from '../testimonial/entity/testimonial.entity';
import { ChangePasswordDTO, UpdateUserDTO } from './dto/update-user.dto';
import { UserEntity } from './entity/user.entity';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(UserEntity) private users: Repository<UserEntity>,
    @InjectRepository(SpaceEntity) private spaces: Repository<SpaceEntity>,
    @InjectRepository(TestimonialEntity)
    private testimonials: Repository<TestimonialEntity>,
  ) {}

  async getProfile(id: number) {
    const user = await this.users.findOne({ where: { id } });
    if (!user) throw new NotFoundException('User not found');
    return user;
  }

  async updateProfile(id: number, dto: UpdateUserDTO) {
    const user = await this.getProfile(id);
    if (dto.name !== undefined) user.name = dto.name.trim();
    if (dto.company !== undefined) user.company = dto.company.trim() || null;
    return this.users.save(user);
  }

  async setAvatar(id: number, filename: string) {
    const user = await this.getProfile(id);
    removeUpload(user.profile_image);
    user.profile_image = `avatars/${filename}`;
    return this.users.save(user);
  }

  async changePassword(id: number, dto: ChangePasswordDTO) {
    const user = await this.users.findOne({
      where: { id },
      select: { id: true, password: true },
    });
    if (!user) throw new NotFoundException('User not found');
    if (!(await bcrypt.compare(dto.current_password, user.password)))
      throw new BadRequestException('Current password is incorrect');
    user.password = await bcrypt.hash(dto.new_password, await bcrypt.genSalt());
    await this.users.save(user);
    return { message: 'Password updated' };
  }

  /** Numbers + a 14-day chart for the dashboard home page */
  async getStats(ownerId: number) {
    const totalSpaces = await this.spaces.count({ where: { owner_id: ownerId } });

    const raw = await this.testimonials
      .createQueryBuilder('t')
      .innerJoin('t.space', 's')
      .select([
        'COUNT(*) AS total',
        `COUNT(*) FILTER (WHERE t.type = 'text') AS text`,
        `COUNT(*) FILTER (WHERE t.type = 'video') AS video`,
        `COUNT(*) FILTER (WHERE t.is_liked = true) AS liked`,
        `COUNT(*) FILTER (WHERE t.is_archived = false AND t.created_at > now() - interval '7 days') AS last7`,
        'ROUND(AVG(t.rating)::numeric, 2) AS avg_rating',
      ])
      .where('s.owner_id = :ownerId', { ownerId })
      .getRawOne();

    const perDay = await this.testimonials
      .createQueryBuilder('t')
      .innerJoin('t.space', 's')
      .select(`to_char(date_trunc('day', t.created_at), 'YYYY-MM-DD')`, 'day')
      .addSelect('COUNT(*)', 'count')
      .where('s.owner_id = :ownerId', { ownerId })
      .andWhere(`t.created_at >= date_trunc('day', now()) - interval '13 days'`)
      .groupBy('day')
      .getRawMany<{ day: string; count: string }>();

    const map = new Map(perDay.map((r) => [r.day, Number(r.count)]));
    const series: { day: string; count: number }[] = [];
    for (let i = 13; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const key = d.toISOString().slice(0, 10);
      series.push({ day: key, count: map.get(key) ?? 0 });
    }

    return {
      total_spaces: totalSpaces,
      total_testimonials: Number(raw.total),
      text_testimonials: Number(raw.text),
      video_testimonials: Number(raw.video),
      liked_testimonials: Number(raw.liked),
      last_7_days: Number(raw.last7),
      average_rating: raw.avg_rating ? Number(raw.avg_rating) : null,
      per_day: series,
    };
  }
}
