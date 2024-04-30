import { Module } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { AppService } from 'src/app.service';
import { PrismaService } from 'src/prisma/prisma.service';
import { UsersModule } from 'src/users/user.module';
import { Utils } from 'src/utils/utils';
// import { GameController } from './game.controller';
import { GameService } from './game.service';

@Module({
  imports: [UsersModule],
  providers: [GameService, PrismaService, JwtService, Utils, AppService],
  controllers: [],
})
export class GameModule {}
