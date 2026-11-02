import {
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  UseGuards,
} from '@nestjs/common';
import { AdminAuthGuard } from './auth/admin.auth.guard';
import { AdminService } from './admin.service';

@Controller('admin')
@UseGuards(AdminAuthGuard)
export class AdminController {
  constructor(private adminService: AdminService) {}

  // GET http://localhost:7000/admin/stats
  @Get('stats')
  stats() {
    return this.adminService.getStats();
  }

  // GET http://localhost:7000/admin/users
  @Get('users')
  users() {
    return this.adminService.listUsers();
  }

  // PATCH http://localhost:7000/admin/users/3/ban
  @Patch('users/:id/ban')
  ban(@Param('id', ParseIntPipe) id: number) {
    return this.adminService.toggleBan(id);
  }

  // DELETE http://localhost:7000/admin/users/3
  @Delete('users/:id')
  removeUser(@Param('id', ParseIntPipe) id: number) {
    return this.adminService.removeUser(id);
  }

  // GET http://localhost:7000/admin/spaces
  @Get('spaces')
  spaces() {
    return this.adminService.listSpaces();
  }

  // DELETE http://localhost:7000/admin/spaces/3
  @Delete('spaces/:id')
  removeSpace(@Param('id', ParseIntPipe) id: number) {
    return this.adminService.removeSpace(id);
  }

  // GET http://localhost:7000/admin/testimonials
  @Get('testimonials')
  testimonials() {
    return this.adminService.listTestimonials();
  }

  // DELETE http://localhost:7000/admin/testimonials/3
  @Delete('testimonials/:id')
  removeTestimonial(@Param('id', ParseIntPipe) id: number) {
    return this.adminService.removeTestimonial(id);
  }
}
