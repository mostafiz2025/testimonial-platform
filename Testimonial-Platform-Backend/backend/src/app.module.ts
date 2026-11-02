import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { ServeStaticModule } from '@nestjs/serve-static';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import { TypeOrmModule } from '@nestjs/typeorm';
import { join } from 'path';

import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthGuardsModule } from './common/auth-guards.module';

import { AdminModule } from './admin/admin.module';
import { AdminAuthModule } from './admin/auth/admin.auth.module';
import { SpaceModule } from './space/space.module';
import { TestimonialModule } from './testimonial/testimonial.module';
import { UserModule } from './user/user.module';
import { UserAuthModule } from './user/auth/user.auth.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),

    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        type: 'postgres',
        host: config.get<string>('DB_HOST', 'localhost'),
        port: Number(config.get('DB_PORT', 5432)),
        username: config.get<string>('DB_USER', 'postgres'),
        password: config.get<string>('DB_PASSWORD'),
        database: config.get<string>('DB_NAME', 'TestimonialDB'),
        autoLoadEntities: true,
        // creates / updates tables automatically. Set DB_SYNC=false in production
        synchronize: config.get('DB_SYNC', 'true') !== 'false',
      }),
    }),

    // one JWT config for users + admins (role is inside the token)
    JwtModule.registerAsync({
      global: true,
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        secret: config.get<string>('JWT_SECRET'),
        signOptions: { expiresIn: '7d' },
      }),
    }),

    // basic protection against spam / brute force
    ThrottlerModule.forRoot([{ ttl: 60_000, limit: 120 }]),

    // Serve uploaded files -> http://localhost:7000/uploads/videos/xxx.webm
    ServeStaticModule.forRoot({
      rootPath: join(process.cwd(), 'uploads'),
      serveRoot: '/uploads',
    }),

    AuthGuardsModule,
    UserModule,
    UserAuthModule,
    AdminModule,
    AdminAuthModule,
    SpaceModule,
    TestimonialModule,
  ],
  controllers: [AppController],
  providers: [AppService, { provide: APP_GUARD, useClass: ThrottlerGuard }],
})
export class AppModule {}
