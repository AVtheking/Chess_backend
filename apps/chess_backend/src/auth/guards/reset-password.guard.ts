import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { jwtResetSecret } from '../constants';
import { BaseGuard } from './base.guard';

@Injectable()
export class ResetPasswordGuard extends BaseGuard {
  constructor(jwtService: JwtService) {
    super(jwtService, jwtResetSecret);
  }
}
