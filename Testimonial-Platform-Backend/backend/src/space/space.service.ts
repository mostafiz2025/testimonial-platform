import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { randomSuffix, slugify } from '../common/slug.util';
import { removeUpload } from '../common/upload.util';
import { TestimonialEntity } from '../testimonial/entity/testimonial.entity';
import { CreateSpaceDTO } from './dto/create-space.dto';
import { UpdateSpaceDTO } from './dto/update-space.dto';
import { SpaceEntity } from './entity/space.entity';

const DEFAULT_QUESTIONS = [
  'Who are you, and what do you do?',
  'How has our product / service helped you?',
  'What is the best thing about it?',
];

@Injectable()
export class SpaceService {
  constructor(
    @InjectRepository(SpaceEntity) private spaces: Repository<SpaceEntity>,
    @InjectRepository(TestimonialEntity)
    private testimonials: Repository<TestimonialEntity>,
  ) {}

  async listForOwner(ownerId: number) {
    const rows = await this.spaces.find({
      where: { owner_id: ownerId },
      order: { created_at: 'DESC' },
    });
    return this.withTestimonialCounts(rows);
  }

  /** adds `testimonials_count` to every space */
  async withTestimonialCounts<T extends { id: number }>(spaces: T[]) {
    if (!spaces.length) return [] as (T & { testimonials_count: number })[];
    const raw = await this.testimonials
      .createQueryBuilder('t')
      .select('t.space_id', 'space_id')
      .addSelect('COUNT(*)', 'count')
      .where('t.space_id IN (:...ids)', { ids: spaces.map((s) => s.id) })
      .groupBy('t.space_id')
      .getRawMany<{ space_id: number; count: string }>();
    const map = new Map(raw.map((r) => [Number(r.space_id), Number(r.count)]));
    return spaces.map((s) =>
      Object.assign(s, { testimonials_count: map.get(s.id) ?? 0 }),
    );
  }

  async findOwned(ownerId: number, id: number) {
    const space = await this.spaces.findOne({ where: { id, owner_id: ownerId } });
    if (!space) throw new NotFoundException('Space not found');
    return space;
  }

  async create(ownerId: number, dto: CreateSpaceDTO) {
    const slug = dto.slug
      ? await this.assertSlugFree(dto.slug)
      : await this.generateSlug(dto.name);

    const space = this.spaces.create({
      ...dto,
      slug,
      owner_id: ownerId,
      logo: null,
      header_title: dto.header_title || `Share your experience with ${dto.name}`,
      custom_message:
        dto.custom_message ||
        'We would love to hear what you think. It only takes a minute!',
      questions: dto.questions ?? DEFAULT_QUESTIONS,
    });
    return this.spaces.save(space);
  }

  async update(ownerId: number, id: number, dto: UpdateSpaceDTO) {
    const space = await this.findOwned(ownerId, id);
    if (dto.slug && dto.slug !== space.slug) {
      await this.assertSlugFree(dto.slug);
    }
    Object.assign(space, dto);
    return this.spaces.save(space);
  }

  async setLogo(ownerId: number, id: number, filename: string) {
    const space = await this.findOwned(ownerId, id);
    removeUpload(space.logo);
    space.logo = `logos/${filename}`;
    return this.spaces.save(space);
  }

  async remove(ownerId: number, id: number) {
    const space = await this.findOwned(ownerId, id);
    await this.purgeSpaceFiles([space.id]);
    await this.spaces.delete(space.id);
    return { deleted: true };
  }

  /** Admin: delete any space */
  async removeAny(id: number) {
    const space = await this.spaces.findOne({ where: { id } });
    if (!space) throw new NotFoundException('Space not found');
    await this.purgeSpaceFiles([id]);
    await this.spaces.delete(id);
    return { deleted: true };
  }

  /** Deletes logo, photos and videos from disk (DB rows are removed by cascade) */
  async purgeSpaceFiles(spaceIds: number[]) {
    if (!spaceIds.length) return;
    const spaces = await this.spaces.find({ where: { id: In(spaceIds) } });
    spaces.forEach((s) => removeUpload(s.logo));
    const items = await this.testimonials.find({
      where: { space_id: In(spaceIds) },
      select: { id: true, photo: true, video: true },
    });
    items.forEach((t) => {
      removeUpload(t.photo);
      removeUpload(t.video);
    });
  }

  async findPublicBySlug(slug: string) {
    const s = await this.spaces.findOne({ where: { slug } });
    if (!s || !s.is_active) throw new NotFoundException('This page does not exist');
    return {
      id: s.id,
      name: s.name,
      slug: s.slug,
      logo: s.logo,
      header_title: s.header_title,
      custom_message: s.custom_message,
      questions: s.questions,
      collect_text: s.collect_text,
      collect_video: s.collect_video,
      collect_star_rating: s.collect_star_rating,
      collect_email: s.collect_email,
      collect_company: s.collect_company,
      collect_job_title: s.collect_job_title,
      collect_photo: s.collect_photo,
      thank_you_title: s.thank_you_title,
      thank_you_message: s.thank_you_message,
      button_color: s.button_color,
    };
  }

  // ---------- helpers ----------
  private async assertSlugFree(slug: string) {
    const exists = await this.spaces.exists({ where: { slug } });
    if (exists) throw new ConflictException('This URL is already taken');
    return slug;
  }

  private async generateSlug(name: string) {
    const base = slugify(name);
    let slug = base;
    while (await this.spaces.exists({ where: { slug } })) {
      slug = `${base}-${randomSuffix()}`;
    }
    return slug;
  }
}
