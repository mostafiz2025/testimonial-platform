import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Param,
  Post,
  UploadedFiles,
  UseInterceptors,
} from '@nestjs/common';
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import { Throttle } from '@nestjs/throttler';
import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { SpaceService } from '../space/space.service';
import {
  removeFiles,
  testimonialFileFilter,
  testimonialStorage,
} from '../common/upload.util';
import { SubmitTestimonialDTO } from './dto/submit-testimonial.dto';
import { TestimonialService } from './testimonial.service';

const MAX_VIDEO = 100 * 1024 * 1024; // 100 MB
const MAX_PHOTO = 5 * 1024 * 1024; // 5 MB

/** Everything under /public needs NO login (customers + wall of love + embeds) */
@Controller('public')
export class PublicController {
  constructor(
    private spaceService: SpaceService,
    private testimonialService: TestimonialService,
  ) {}

  // GET http://localhost:7000/public/spaces/my-product
  @Get('spaces/:slug')
  getSpace(@Param('slug') slug: string) {
    return this.spaceService.findPublicBySlug(slug);
  }

  // POST http://localhost:7000/public/spaces/my-product/testimonials
  // form-data: name, email, rating, message, consent, [photo], [video]
  @Throttle({ default: { limit: 8, ttl: 60_000 } })
  @Post('spaces/:slug/testimonials')
  @UseInterceptors(
    FileFieldsInterceptor(
      [
        { name: 'photo', maxCount: 1 },
        { name: 'video', maxCount: 1 },
      ],
      {
        storage: testimonialStorage,
        fileFilter: testimonialFileFilter,
        limits: { fileSize: MAX_VIDEO, files: 2 },
      },
    ),
  )
  async submit(
    @Param('slug') slug: string,
    @Body() body: Record<string, any>,
    @UploadedFiles()
    uploaded: { photo?: Express.Multer.File[]; video?: Express.Multer.File[] },
  ) {
    const photo = uploaded?.photo?.[0];
    const video = uploaded?.video?.[0];
    const all = [photo, video].filter(Boolean) as Express.Multer.File[];

    // validate manually so uploaded files can be cleaned up on failure
    const dto = plainToInstance(SubmitTestimonialDTO, body);
    const errors = await validate(dto, { whitelist: true });
    if (errors.length) {
      removeFiles(all);
      throw new BadRequestException(
        errors.flatMap((e) => Object.values(e.constraints ?? {})),
      );
    }
    if (photo && photo.size > MAX_PHOTO) {
      removeFiles(all);
      throw new BadRequestException('Photo must be smaller than 5 MB');
    }

    try {
      return await this.testimonialService.submit(slug, dto, { photo, video });
    } catch (e) {
      removeFiles(all);
      throw e;
    }
  }

  // GET http://localhost:7000/public/wall/my-product
  @Get('wall/:slug')
  wall(@Param('slug') slug: string) {
    return this.testimonialService.wall(slug);
  }
}
