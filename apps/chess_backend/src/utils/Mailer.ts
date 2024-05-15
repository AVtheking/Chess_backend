import { MailerService } from '@nestjs-modules/mailer';
import { Injectable } from '@nestjs/common';

@Injectable()
export class Mailer {
  constructor(private mailerService: MailerService) {}
  sendMail(
    email: string,

    subject: string,

    html: string,
  ) {
    console.log('\x1b[33mSending mail to: \x1b[1m', email);
    this.mailerService.sendMail({
      from: process.env.Email,
      to: email,
      subject: subject,
      html: html,
    });
  }
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

    this.sendMail(email, emailSubject, html);
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
    this.sendMail(email, emailSubject, html);
  }
}
