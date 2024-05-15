import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { AppService } from '../app.service';
import { PrismaService } from '../prisma/prisma.service';
import { Utils } from '../utils/utils';
import { UserController } from './users.controller';
import { UsersService } from './users.service';

@Module({
  imports: [JwtModule.register({})],
  controllers: [UserController],
  providers: [UsersService, PrismaService, AppService, Utils],
  exports: [UsersService],
})
export class UsersModule {}
