import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SpaceEntity } from '../space/entity/space.entity';
import { SpaceModule } from '../space/space.module';
import { TestimonialEntity } from '../testimonial/entity/testimonial.entity';
import { TestimonialModule } from '../testimonial/testimonial.module';
import { UserEntity } from '../user/entity/user.entity';
import { AdminController } from './admin.controller';
import { AdminService } from './admin.service';
import { AdminEntity } from './entity/admin.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      AdminEntity,
      UserEntity,
      SpaceEntity,
      TestimonialEntity,
    ]),
    SpaceModule,
    TestimonialModule,
  ],
  controllers: [AdminController],
  providers: [AdminService],
})
export class AdminModule {}
