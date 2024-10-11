import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';

import { PrismaService } from '../prisma/prisma.service';
import { UsersService } from '../users/users.service';
import { Utils } from '../utils/utils';
import { GameGateWay } from './game.gateway';

@Module({
  imports: [JwtModule.register({})],
  providers: [GameGateWay, PrismaService, UsersService, Utils],
})
export class GameModule {}
