import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  // GET http://localhost:7000/
  @Get()
  health() {
    return this.appService.health();
  }
}
