/* eslint-disable prettier/prettier */
import { MailerService } from '@nestjs-modules/mailer';
import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  constructor(private readonly mailerService: MailerService) {}
  getHello(): string {
    return 'Hello World!';
  }

  sendMail(email: string, otp: number) {
    console.log('Sending mail to: ', email);
    this.mailerService.sendMail({
      from: process.env.Email,
      to: email,
      subject: 'Testing Nest MailerModule ✔',
      text: 'Forget Your passowrd? No worries, we got you covered!',
      html: `<b>Forget Your passowrd? No worries, we got you covered!</b>
      <p>Here is your OTP: <b>'  ${otp} '</b></p>
      `,
    });
  }
}
