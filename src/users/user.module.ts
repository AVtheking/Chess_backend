import { Module } from '@nestjs/common';
import { AppService } from 'src/app.service';
import { PrismaService } from 'src/prisma/prisma.service';
import { UsersService } from './users.service';

@Module({
  providers: [UsersService, PrismaService, AppService],
  exports: [UsersService],
})
export class UsersModule {}
