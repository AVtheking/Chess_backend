import { Module } from '@nestjs/common';

import { AppService } from '../app.service';
import { PrismaService } from '../prisma/prisma.service';
import { OtpService } from './otp.service';

@Module({
  providers: [OtpService, AppService, PrismaService],
  exports: [OtpService],
})
export class OtpModule {}
