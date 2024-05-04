import { Injectable } from '@nestjs/common';
import { Otp } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class OtpService {
  constructor(private prisma: PrismaService) {}

  async getOtp(email: string): Promise<Otp> {
    const otp = await this.prisma.otp.findUnique({
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
  //checks if the otp is expired or not
  async checkExpiration(otp: Otp): Promise<boolean> {
    const currentTime = new Date();
    const otpTime = otp?.createdAt;
    const diff = currentTime.getTime() - otpTime.getTime();
    return diff < 60000;
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

    return otp;
  }
}
