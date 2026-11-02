import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  health() {
    return { name: 'Testimonial API', status: 'ok', time: new Date() };
  }
}
