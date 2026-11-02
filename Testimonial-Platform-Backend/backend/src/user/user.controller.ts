import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Patch,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { CurrentUserId } from '../common/current-user.decorator';
import { imageFileFilter, singleFolderStorage } from '../common/upload.util';
import { UserAuthGuard } from './auth/user.auth.guard';
import { ChangePasswordDTO, UpdateUserDTO } from './dto/update-user.dto';
import { UserService } from './user.service';

@Controller('user')
@UseGuards(UserAuthGuard)
export class UserController {
  constructor(private userService: UserService) {}

  // GET http://localhost:7000/user/profile
  @Get('profile')
  profile(@CurrentUserId() id: number) {
    return this.userService.getProfile(id);
  }

  // PATCH http://localhost:7000/user/profile
  @Patch('profile')
  update(@CurrentUserId() id: number, @Body() dto: UpdateUserDTO) {
    return this.userService.updateProfile(id, dto);
  }

  // PATCH http://localhost:7000/user/avatar   (form-data: myfile)
  @Patch('avatar')
  @UseInterceptors(
    FileInterceptor('myfile', {
      storage: singleFolderStorage('avatars'),
      fileFilter: imageFileFilter,
      limits: { fileSize: 2 * 1024 * 1024 },
    }),
  )
  avatar(@CurrentUserId() id: number, @UploadedFile() file: Express.Multer.File) {
    if (!file) throw new BadRequestException('Please choose an image (max 2 MB)');
    return this.userService.setAvatar(id, file.filename);
  }

  // PATCH http://localhost:7000/user/password
  @Patch('password')
  password(@CurrentUserId() id: number, @Body() dto: ChangePasswordDTO) {
    return this.userService.changePassword(id, dto);
  }

  // GET http://localhost:7000/user/stats
  @Get('stats')
  stats(@CurrentUserId() id: number) {
    return this.userService.getStats(id);
  }
}
