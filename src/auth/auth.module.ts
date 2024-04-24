import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { AppService } from 'src/app.service';
import { OtpService } from 'src/otp/otp.service';
import { PrismaService } from 'src/prisma/prisma.service';
import { UsersModule } from 'src/users/user.module';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';

@Module({
  imports: [UsersModule, JwtModule.register({})],

  controllers: [AuthController],
  providers: [AuthService, OtpService, PrismaService, AppService],
  exports: [AuthService],
})
export class AuthModule {}
