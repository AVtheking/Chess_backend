import { MailerModule } from '@nestjs-modules/mailer';
import { MiddlewareConsumer, Module, RequestMethod } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { RequestLoggingMiddleware } from './middleware/logger.middleware';
import { PrismaService } from './prisma/prisma.service';
import { UsersModule } from './users/user.module';
import { OtpModule } from './otp/otp.module';

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
  providers: [AppService, PrismaService, RequestLoggingMiddleware],
})
export class AppModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(RequestLoggingMiddleware)
      .forRoutes({ path: '*', method: RequestMethod.ALL });
  }
}
