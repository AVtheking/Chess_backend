import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { jwtRefreshSecret } from '../constants';
import { BaseGuard } from './base.guard';

@Injectable()
export class RefreshTokenGuard extends BaseGuard {
  constructor(jwtService: JwtService) {
    super(jwtService, jwtRefreshSecret);
  }
}
