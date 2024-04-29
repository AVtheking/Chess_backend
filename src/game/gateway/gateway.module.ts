import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PrismaService } from 'src/prisma/prisma.service';
import { UsersService } from 'src/users/users.service';
import { Utils } from 'src/utils/utils';
import { GameService } from '../game.service';
import { gameGateWay } from './game.gateway';

@Module({
  imports: [JwtModule.register({})],
  providers: [gameGateWay, GameService, PrismaService, UsersService, Utils],
})
export class GatewayModule {}
