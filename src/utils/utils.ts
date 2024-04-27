import { Injectable } from '@nestjs/common';
import { Response } from 'express';
import { AppService } from 'src/app.service';
import {
  charsDigits,
  charsLowercase,
  charsSpecial,
  charsUppercase,
} from 'src/auth/constants';

@Injectable()
export class Utils {
  constructor(private readonly appService: AppService) {}
  async sendEmailVerificationMail(email: string, otp: number) {
    const emailSubject = 'Email Verification OTP';
    const html = `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 20px auto; padding: 20px; background-color: #f4f4f4; border-radius: 5px;">
              <h2 style="color: #333;">Email Verification OTP</h2>
              <p>Please use the following OTP to verify your email:</p>
              <div style="font-size: 24px; font-weight: bold; color: #007bff;">${otp}</div>
              <p>If you didn't request this OTP, please ignore this email.</p>
              <p>Thank you!</p>
          </div>
      `;

    this.appService.sendMail(email, emailSubject, html);
  }
  async sendForgetPasswordMail(email: string, otp: number) {
    const emailSubject = 'Reset Password Request';

    const html = `
        <p><b>Request to reset password is requested on this registered email.</b></p>
        <p>If it is not you, please ignore this and do not share OTP with anyone.</p>
        <div style="margin-top: 20px; text-align: center; font-size: 24px; color: blue;">
          <b>Your OTP:</b> ${otp}
        </div>
      `;
    this.appService.sendMail(email, emailSubject, html);
  }
  async sendHttpResponse(
    success: boolean,
    statusCode: number,
    message: string,
    data: any,
    res: Response,
  ) {
    return res.status(statusCode).json({
      success,
      message,
      data: {
        ...data,
      },
    });
  }
  randomPassword() {
    let password = '';
    for (let i = 0; i < 8; i++) {
      password += charsLowercase.charAt(
        Math.floor(Math.random() * charsLowercase.length),
      );
      password += charsUppercase.charAt(
        Math.floor(Math.random() * charsUppercase.length),
      );
      password += charsSpecial.charAt(
        Math.floor(Math.random() * charsSpecial.length),
      );
      password += charsDigits.charAt(
        Math.floor(Math.random() * charsDigits.length),
      );
    }

    return password;
  }
  randomInteger(min: number, max: number) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }
}
