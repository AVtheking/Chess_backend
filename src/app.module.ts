import { MailerModule } from '@nestjs-modules/mailer';
import { Module } from '@nestjs/common';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { GoogleStrategy } from './auth/strategy/google.strategy';
import { LoggingInterceptor } from './interceptors/app.interceptor';
import { RequestLoggingMiddleware } from './middleware/logger.middleware';
import { OtpModule } from './otp/otp.module';
import { PrismaService } from './prisma/prisma.service';
import { UsersModule } from './users/user.module';
import { Utils } from './utils/utils';

@Module({
  imports: [
    AuthModule,
    UsersModule,
    MailerModule.forRoot({
      transport: {
        host: process.env.EMAIL_HOST,
        auth: {
          user: process.env.EMAIL,
          pass: process.env.PASS,
        },
      },
    }),
    OtpModule,
  ],
  controllers: [AppController],
  providers: [
    {
      provide: APP_INTERCEPTOR,
      useClass: LoggingInterceptor,
    },
    AppService,
    PrismaService,
    Utils,
    RequestLoggingMiddleware,
    GoogleStrategy,
  ],
})
export class AppModule {
  // configure(consumer: MiddlewareConsumer) {
  //   consumer
  //     .apply(RequestLoggingMiddleware)
  //     .forRoutes({ path: '*', method: RequestMethod.ALL });
  // }
}
