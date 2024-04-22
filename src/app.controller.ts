import { Controller, Get, Post } from '@nestjs/common';
import { AppService } from './app.service';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }
  @Post('sendMail')
  sendMail(): any {
    this.appService.sendMail('lyfflame45@gmail.com', 1234);
    console.log('Mail sent');
    return 'Mail sent successfully!';
  }
}
