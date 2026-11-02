import {
  Injectable,
  Logger,
  NotFoundException,
  OnModuleInit,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import * as bcrypt from 'bcrypt';
import { Repository } from 'typeorm';
import { removeUpload } from '../common/upload.util';
import { SpaceEntity } from '../space/entity/space.entity';
import { SpaceService } from '../space/space.service';
import { TestimonialEntity } from '../testimonial/entity/testimonial.entity';
import { TestimonialService } from '../testimonial/testimonial.service';
import { UserEntity } from '../user/entity/user.entity';
import { AdminEntity } from './entity/admin.entity';

@Injectable()
export class AdminService implements OnModuleInit {
  private readonly logger = new Logger(AdminService.name);

  constructor(
    @InjectRepository(AdminEntity) private admins: Repository<AdminEntity>,
    @InjectRepository(UserEntity) private users: Repository<UserEntity>,
    @InjectRepository(SpaceEntity) private spaces: Repository<SpaceEntity>,
    @InjectRepository(TestimonialEntity)
    private testimonials: Repository<TestimonialEntity>,
    private spaceService: SpaceService,
    private testimonialService: TestimonialService,
  ) {}

  /** Creates the first admin account automatically (values come from .env) */
  async onModuleInit() {
    if ((await this.admins.count()) > 0) return;
    const email = (process.env.ADMIN_EMAIL || 'admin@testimonial.local').toLowerCase();
    const password = process.env.ADMIN_PASSWORD || 'Admin@12345';
    await this.admins.save(
      this.admins.create({
        name: 'Super Admin',
        email,
        password: await bcrypt.hash(password, await bcrypt.genSalt()),
      }),
    );
    this.logger.log(`Default admin created -> ${email}`);
  }

  async getStats() {
    const [users, spaces, total, video, liked] = await Promise.all([
      this.users.count(),
      this.spaces.count(),
      this.testimonials.count(),
      this.testimonials.count({ where: { type: 'video' as any } }),
      this.testimonials.count({ where: { is_liked: true } }),
    ]);
    return {
      total_users: users,
      total_spaces: spaces,
      total_testimonials: total,
      video_testimonials: video,
      text_testimonials: total - video,
      liked_testimonials: liked,
    };
  }

  async listUsers() {
    const users = await this.users.find({ order: { created_at: 'DESC' } });
    const raw = await this.spaces
      .createQueryBuilder('s')
      .select('s.owner_id', 'owner_id')
      .addSelect('COUNT(*)', 'count')
      .groupBy('s.owner_id')
      .getRawMany<{ owner_id: number; count: string }>();
    const map = new Map(raw.map((r) => [Number(r.owner_id), Number(r.count)]));
    return users.map((u) =>
      Object.assign(u, { spaces_count: map.get(u.id) ?? 0 }),
    );
  }

  async toggleBan(id: number) {
    const user = await this.users.findOne({ where: { id } });
    if (!user) throw new NotFoundException('User not found');
    user.is_banned = !user.is_banned;
    await this.users.update(id, { is_banned: user.is_banned });
    return { id, is_banned: user.is_banned };
  }

  async removeUser(id: number) {
    const user = await this.users.findOne({ where: { id } });
    if (!user) throw new NotFoundException('User not found');
    const spaces = await this.spaces.find({
      where: { owner_id: id },
      select: { id: true },
    });
    await this.spaceService.purgeSpaceFiles(spaces.map((s) => s.id));
    removeUpload(user.profile_image);
    await this.users.delete(id); // spaces + testimonials are removed by cascade
    return { deleted: true };
  }

  async listSpaces() {
    const spaces = await this.spaces.find({
      relations: { owner: true },
      order: { created_at: 'DESC' },
    });
    return this.spaceService.withTestimonialCounts(spaces);
  }

  removeSpace(id: number) {
    return this.spaceService.removeAny(id);
  }

  async listTestimonials() {
    return this.testimonials.find({
      relations: { space: true },
      order: { created_at: 'DESC' },
      take: 200,
    });
  }

  removeTestimonial(id: number) {
    return this.testimonialService.removeAny(id);
  }
}
