import { Module } from '@nestjs/common';
import { AppService } from 'src/app.service';
import { PrismaService } from 'src/prisma/prisma.service';
import { Utils } from 'src/utils/send-mail';
import { UsersService } from './users.service';

@Module({
  providers: [UsersService, PrismaService, Utils, AppService],
  exports: [UsersService],
})
export class UsersModule {}
