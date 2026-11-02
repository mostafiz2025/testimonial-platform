import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { CurrentUserId } from '../common/current-user.decorator';
import { UserAuthGuard } from '../user/auth/user.auth.guard';
import { ImportTestimonialDTO } from './dto/submit-testimonial.dto';
import { QueryTestimonialDTO } from './dto/query-testimonial.dto';
import { TestimonialService } from './testimonial.service';

/** /spaces/:spaceId/testimonials  -> list + manual import */
@Controller('spaces/:spaceId/testimonials')
@UseGuards(UserAuthGuard)
export class SpaceTestimonialController {
  constructor(private service: TestimonialService) {}

  // GET http://localhost:7000/spaces/1/testimonials?filter=liked&search=john
  @Get()
  list(
    @CurrentUserId() userId: number,
    @Param('spaceId', ParseIntPipe) spaceId: number,
    @Query() query: QueryTestimonialDTO,
  ) {
    return this.service.list(userId, spaceId, query);
  }

  // POST http://localhost:7000/spaces/1/testimonials
  @Post()
  importManual(
    @CurrentUserId() userId: number,
    @Param('spaceId', ParseIntPipe) spaceId: number,
    @Body() dto: ImportTestimonialDTO,
  ) {
    return this.service.importManual(userId, spaceId, dto);
  }
}

/** /testimonials/:id -> like / archive / delete */
@Controller('testimonials')
@UseGuards(UserAuthGuard)
export class TestimonialController {
  constructor(private service: TestimonialService) {}

  // PATCH http://localhost:7000/testimonials/5/like
  @Patch(':id/like')
  like(@CurrentUserId() userId: number, @Param('id', ParseIntPipe) id: number) {
    return this.service.toggleLike(userId, id);
  }

  // PATCH http://localhost:7000/testimonials/5/archive
  @Patch(':id/archive')
  archive(
    @CurrentUserId() userId: number,
    @Param('id', ParseIntPipe) id: number,
  ) {
    return this.service.toggleArchive(userId, id);
  }

  // DELETE http://localhost:7000/testimonials/5
  @Delete(':id')
  remove(
    @CurrentUserId() userId: number,
    @Param('id', ParseIntPipe) id: number,
  ) {
    return this.service.remove(userId, id);
  }
}
