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
}
