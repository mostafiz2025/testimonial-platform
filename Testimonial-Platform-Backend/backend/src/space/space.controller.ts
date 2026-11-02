import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { CurrentUserId } from '../common/current-user.decorator';
import {
  imageFileFilter,
  singleFolderStorage,
} from '../common/upload.util';
import { UserAuthGuard } from '../user/auth/user.auth.guard';
import { CreateSpaceDTO } from './dto/create-space.dto';
import { UpdateSpaceDTO } from './dto/update-space.dto';
import { SpaceService } from './space.service';

@Controller('spaces')
@UseGuards(UserAuthGuard)
export class SpaceController {
  constructor(private spaceService: SpaceService) {}

  // GET http://localhost:7000/spaces
  @Get()
  list(@CurrentUserId() userId: number) {
    return this.spaceService.listForOwner(userId);
  }

  // POST http://localhost:7000/spaces
  @Post()
  create(@CurrentUserId() userId: number, @Body() dto: CreateSpaceDTO) {
    return this.spaceService.create(userId, dto);
  }

  // GET http://localhost:7000/spaces/1
  @Get(':id')
  getOne(
    @CurrentUserId() userId: number,
    @Param('id', ParseIntPipe) id: number,
  ) {
    return this.spaceService.findOwned(userId, id);
  }

  // PATCH http://localhost:7000/spaces/1
  @Patch(':id')
  update(
    @CurrentUserId() userId: number,
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateSpaceDTO,
  ) {
    return this.spaceService.update(userId, id, dto);
  }

  // PATCH http://localhost:7000/spaces/1/logo   (form-data: logo)
  @Patch(':id/logo')
  @UseInterceptors(
    FileInterceptor('logo', {
      storage: singleFolderStorage('logos'),
      fileFilter: imageFileFilter,
      limits: { fileSize: 2 * 1024 * 1024 },
    }),
  )
  setLogo(
    @CurrentUserId() userId: number,
    @Param('id', ParseIntPipe) id: number,
    @UploadedFile() logo: Express.Multer.File,
  ) {
    if (!logo) throw new BadRequestException('Please choose an image (max 2 MB)');
    return this.spaceService.setLogo(userId, id, logo.filename);
  }

  // DELETE http://localhost:7000/spaces/1
  @Delete(':id')
  remove(
    @CurrentUserId() userId: number,
    @Param('id', ParseIntPipe) id: number,
  ) {
    return this.spaceService.remove(userId, id);
  }
}
