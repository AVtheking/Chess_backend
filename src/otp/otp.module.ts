import { Module } from '@nestjs/common';
import { AppService } from 'src/app.service';
import { PrismaService } from 'src/prisma/prisma.service';
import { OtpService } from './otp.service';

@Module({
  providers: [OtpService, AppService, PrismaService],
  exports: [OtpService],
})
export class OtpModule {}
