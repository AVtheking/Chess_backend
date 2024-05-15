import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';

import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { UsersModule } from '../users/user.module';
import { OtpService } from '../otp/otp.service';
import { PrismaService } from '../prisma/prisma.service';
import { Utils } from '../utils/utils';
import { Mailer } from '../utils/Mailer';

@Module({
  imports: [UsersModule, JwtModule.register({}), HttpModule],

  controllers: [AuthController],
  providers: [AuthService, OtpService, PrismaService, Utils, Mailer],
  exports: [AuthService],
})
export class AuthModule {}
