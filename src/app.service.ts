/* eslint-disable prettier/prettier */
import { MailerService } from '@nestjs-modules/mailer';
import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  constructor(private readonly mailerService: MailerService) {}
  getHello(): string {
    return 'Hello World!';
  }

  sendMail(
    email: string,
    otp: number,
    subject: string,
    text: string,
    html: string,
  ) {
    console.log('Sending mail to: ', email);
    this.mailerService.sendMail({
      from: process.env.Email,
      to: email,
      subject: subject,
      text: text,
      html: html,
    });
  }
}
