import { Injectable } from '@nestjs/common';
import { Otp } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class OtpService {
  constructor(
    private prisma: PrismaService,
    // private readonly appService: AppService,
  ) {}

  async getOtp(email: string): Promise<Otp> {
    const otp = await this.prisma.otp.findFirst({
      where: {
        email,
      },
    });
    return otp;
  }
  async deleteOtp(email: string) {
    await this.prisma.otp.delete({
      where: {
        email,
      },
    });
  }
  async generateOtp(email: string): Promise<number> {
    const otp = Math.floor(1000 + Math.random() * 9000);
    const existingOtp = await this.prisma.otp.findFirst({
      where: {
        email,
      },
    });
    if (existingOtp) {
      await this.prisma.otp.update({
        where: {
          id: existingOtp.id,
        },
        data: {
          otp,
        },
      });
    } else {
      await this.prisma.otp.create({
        data: {
          email,
          otp,
        },
      });
    }
    // this.appService.sendMail(email, otp);
    return otp;
  }
}
