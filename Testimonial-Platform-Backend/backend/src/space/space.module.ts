import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TestimonialEntity } from '../testimonial/entity/testimonial.entity';
import { SpaceEntity } from './entity/space.entity';
import { SpaceController } from './space.controller';
import { SpaceService } from './space.service';

@Module({
  imports: [TypeOrmModule.forFeature([SpaceEntity, TestimonialEntity])],
  controllers: [SpaceController],
  providers: [SpaceService],
  exports: [SpaceService],
})
export class SpaceModule {}
