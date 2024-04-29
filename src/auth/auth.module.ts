import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { OtpService } from 'src/otp/otp.service';
import { PrismaService } from 'src/prisma/prisma.service';
import { UsersModule } from 'src/users/user.module';
import { Mailer } from 'src/utils/Mailer';
import { Utils } from 'src/utils/utils';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';

@Module({
  imports: [UsersModule, JwtModule.register({}), HttpModule],

  controllers: [AuthController],
  providers: [AuthService, OtpService, PrismaService, Utils, Mailer],
  exports: [AuthService],
})
export class AuthModule {}
