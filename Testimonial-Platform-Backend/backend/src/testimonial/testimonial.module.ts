import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SpaceEntity } from '../space/entity/space.entity';
import { SpaceModule } from '../space/space.module';
import { TestimonialEntity } from './entity/testimonial.entity';
import { PublicController } from './public.controller';
import {
  SpaceTestimonialController,
  TestimonialController,
} from './testimonial.controller';
import { TestimonialService } from './testimonial.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([TestimonialEntity, SpaceEntity]),
    SpaceModule,
  ],
  controllers: [
    SpaceTestimonialController,
    TestimonialController,
    PublicController,
  ],
  providers: [TestimonialService],
  exports: [TestimonialService],
})
export class TestimonialModule {}
