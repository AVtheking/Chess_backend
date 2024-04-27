import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { AppService } from 'src/app.service';
import { OtpService } from 'src/otp/otp.service';
import { PrismaService } from 'src/prisma/prisma.service';
import { UsersModule } from 'src/users/user.module';
import { Utils } from 'src/utils/utils';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
// import { GoogleStrategy } from './strategy/google.strategy';

@Module({
  imports: [UsersModule, JwtModule.register({}), HttpModule],

  controllers: [AuthController],
  providers: [
    AppService,
    AuthService,
    OtpService,
    PrismaService,
    Utils,

    // GoogleStrategy,
  ],
  exports: [AuthService],
})
export class AuthModule {}
