import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { jwtAccessSecret } from '../constants';
import { BaseGuard } from './base.guard';

@Injectable()
export class AuthGuard extends BaseGuard {
  constructor(jwtService: JwtService) {
    super(jwtService, jwtAccessSecret);
  }
}
