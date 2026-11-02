import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Brackets, Repository } from 'typeorm';
import { MailService } from '../common/mail.service';
import { removeUpload } from '../common/upload.util';
import { SpaceEntity } from '../space/entity/space.entity';
import { ImportTestimonialDTO, SubmitTestimonialDTO } from './dto/submit-testimonial.dto';
import {
  QueryTestimonialDTO,
  TestimonialFilter,
} from './dto/query-testimonial.dto';
import {
  TestimonialEntity,
  TestimonialSource,
  TestimonialType,
} from './entity/testimonial.entity';
import { UserEntity } from '../user/entity/user.entity';

@Injectable()
export class TestimonialService {
  constructor(
    @InjectRepository(TestimonialEntity)
    private repo: Repository<TestimonialEntity>,
    @InjectRepository(SpaceEntity) private spaces: Repository<SpaceEntity>,
    @InjectRepository(UserEntity) private users: Repository<UserEntity>,
    private mail: MailService,
  ) {}

  // ================= OWNER SIDE =================

  private async assertOwnsSpace(ownerId: number, spaceId: number) {
    const space = await this.spaces.findOne({
      where: { id: spaceId, owner_id: ownerId },
    });
    if (!space) throw new NotFoundException('Space not found');
    return space;
  }

  private async findOwnedTestimonial(ownerId: number, id: number) {
    const t = await this.repo.findOne({ where: { id }, relations: { space: true } });
    if (!t || t.space.owner_id !== ownerId)
      throw new NotFoundException('Testimonial not found');
    return t;
  }

  async list(ownerId: number, spaceId: number, q: QueryTestimonialDTO) {
    await this.assertOwnsSpace(ownerId, spaceId);

    const page = q.page ?? 1;
    const limit = q.limit ?? 50;
    const filter = q.filter ?? TestimonialFilter.INBOX;

    const qb = this.repo
      .createQueryBuilder('t')
      .where('t.space_id = :spaceId', { spaceId });

    switch (filter) {
      case TestimonialFilter.ARCHIVED:
        qb.andWhere('t.is_archived = true');
        break;
      case TestimonialFilter.LIKED:
        qb.andWhere('t.is_liked = true').andWhere('t.is_archived = false');
        break;
      case TestimonialFilter.TEXT:
        qb.andWhere('t.type = :type', { type: TestimonialType.TEXT }).andWhere(
          't.is_archived = false',
        );
        break;
      case TestimonialFilter.VIDEO:
        qb.andWhere('t.type = :type', { type: TestimonialType.VIDEO }).andWhere(
          't.is_archived = false',
        );
        break;
      default:
        qb.andWhere('t.is_archived = false');
    }

    const search = q.search?.trim();
    if (search) {
      qb.andWhere(
        new Brackets((w) => {
          w.where('t.name ILIKE :s', { s: `%${search}%` })
            .orWhere('t.message ILIKE :s', { s: `%${search}%` })
            .orWhere('t.company ILIKE :s', { s: `%${search}%` });
        }),
      );
    }

    const [items, total] = await qb
      .orderBy('t.created_at', 'DESC')
      .skip((page - 1) * limit)
      .take(limit)
      .getManyAndCount();

    const raw = await this.repo
      .createQueryBuilder('t')
      .select([
        `COUNT(*) FILTER (WHERE t.is_archived = false) AS inbox`,
        `COUNT(*) FILTER (WHERE t.is_archived = false AND t.type = 'text') AS text`,
        `COUNT(*) FILTER (WHERE t.is_archived = false AND t.type = 'video') AS video`,
        `COUNT(*) FILTER (WHERE t.is_archived = false AND t.is_liked = true) AS liked`,
        `COUNT(*) FILTER (WHERE t.is_archived = true) AS archived`,
      ])
      .where('t.space_id = :spaceId', { spaceId })
      .getRawOne();

    return {
      items,
      total,
      page,
      limit,
      counts: {
        inbox: Number(raw.inbox),
        text: Number(raw.text),
        video: Number(raw.video),
        liked: Number(raw.liked),
        archived: Number(raw.archived),
      },
    };
  }

  async importManual(ownerId: number, spaceId: number, dto: ImportTestimonialDTO) {
    await this.assertOwnsSpace(ownerId, spaceId);
    const t = this.repo.create({
      space_id: spaceId,
      type: TestimonialType.TEXT,
      source: TestimonialSource.IMPORTED,
      name: dto.name,
      job_title: dto.job_title || null,
      company: dto.company || null,
      rating: dto.rating ?? null,
      message: dto.message,
      consent: true,
    });
    return this.repo.save(t);
  }

  async toggleLike(ownerId: number, id: number) {
    const t = await this.findOwnedTestimonial(ownerId, id);
    t.is_liked = !t.is_liked;
    await this.repo.update(id, { is_liked: t.is_liked });
    return { id, is_liked: t.is_liked };
  }

  async toggleArchive(ownerId: number, id: number) {
    const t = await this.findOwnedTestimonial(ownerId, id);
    t.is_archived = !t.is_archived;
    // archived testimonials never appear on the wall
    const patch: Partial<TestimonialEntity> = { is_archived: t.is_archived };
    if (t.is_archived) patch.is_liked = false;
    await this.repo.update(id, patch);
    return { id, is_archived: t.is_archived, is_liked: patch.is_liked ?? t.is_liked };
  }

  async remove(ownerId: number, id: number) {
    const t = await this.findOwnedTestimonial(ownerId, id);
    removeUpload(t.photo);
    removeUpload(t.video);
    await this.repo.delete(id);
    return { deleted: true };
  }

  /** Admin */
  async removeAny(id: number) {
    const t = await this.repo.findOne({ where: { id } });
    if (!t) throw new NotFoundException('Testimonial not found');
    removeUpload(t.photo);
    removeUpload(t.video);
    await this.repo.delete(id);
    return { deleted: true };
  }

  // ================= PUBLIC SIDE =================

  async submit(
    slug: string,
    dto: SubmitTestimonialDTO,
    files: { photo?: Express.Multer.File; video?: Express.Multer.File },
  ) {
    const space = await this.spaces.findOne({ where: { slug } });
    if (!space || !space.is_active)
      throw new NotFoundException('This page does not exist');

    const isVideo = !!files.video;
    if (isVideo && !space.collect_video)
      throw new BadRequestException('Video testimonials are turned off');
    if (!isVideo && !space.collect_text)
      throw new BadRequestException('Text testimonials are turned off');
    if (!isVideo && !dto.message?.trim())
      throw new BadRequestException('Please write your testimonial');
    if (space.collect_email && !dto.email)
      throw new BadRequestException('E-mail is required');
    if (!dto.consent)
      throw new BadRequestException(
        'Please give permission to display your testimonial',
      );

    const t = this.repo.create({
      space_id: space.id,
      type: isVideo ? TestimonialType.VIDEO : TestimonialType.TEXT,
      name: dto.name,
      email: space.collect_email ? (dto.email ?? null) : null,
      job_title: space.collect_job_title ? (dto.job_title ?? null) : null,
      company: space.collect_company ? (dto.company ?? null) : null,
      rating: space.collect_star_rating ? (dto.rating ?? null) : null,
      message: dto.message || null,
      consent: dto.consent,
      photo:
        space.collect_photo && files.photo ? `photos/${files.photo.filename}` : null,
      video: files.video ? `videos/${files.video.filename}` : null,
    });
    const saved = await this.repo.save(t);

    // fire-and-forget e-mail to the space owner
    this.users
      .findOne({ where: { id: space.owner_id } })
      .then((owner) =>
        owner
          ? this.mail.sendNewTestimonial(
              owner.email,
              space.name,
              space.id,
              saved.name,
              saved.type,
            )
          : undefined,
      )
      .catch(() => undefined);

    return { success: true, id: saved.id };
  }

  /** Wall of Love: only hearted + not archived testimonials, no private data */
  async wall(slug: string) {
    const space = await this.spaces.findOne({ where: { slug } });
    if (!space || !space.is_active)
      throw new NotFoundException('This wall does not exist');

    const items = await this.repo.find({
      where: { space_id: space.id, is_liked: true, is_archived: false },
      order: { created_at: 'DESC' },
    });

    return {
      space: {
        name: space.name,
        slug: space.slug,
        logo: space.logo,
        button_color: space.button_color,
        wall_theme: space.wall_theme,
        wall_layout: space.wall_layout,
        wall_show_rating: space.wall_show_rating,
        wall_show_date: space.wall_show_date,
        wall_show_branding: space.wall_show_branding,
      },
      testimonials: items.map((t) => ({
        id: t.id,
        type: t.type,
        name: t.name,
        job_title: t.job_title,
        company: t.company,
        photo: t.photo,
        video: t.video,
        rating: t.rating,
        message: t.message,
        created_at: t.created_at,
      })),
    };
  }
}
