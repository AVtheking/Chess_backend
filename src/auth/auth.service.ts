import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { plainToInstance } from 'class-transformer';
import { UsersService } from 'src/users/users.service';
import { jwtAccessSecret, jwtRefreshSecret } from './constants';
import { CreateUserDto } from './dto/register-user.dto';
import { ResponseUserDto } from './dto/response-user.dto';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
  ) {}
  async signUp(signUp: CreateUserDto): Promise<any> {
    const user = await this.usersService.createUser(signUp);
    const accessToken = this.jwtService.sign(
      {
        userId: user.id,
      },
      {
        secret: jwtAccessSecret.secret,
        expiresIn: '1h',
      },
    );
    const refreshToken = this.jwtService.sign(
      {
        userId: user.id,
      },
      {
        secret: jwtRefreshSecret.secret,
        expiresIn: '10d',
      },
    );

    return plainToInstance(ResponseUserDto, {
      ...user,
      accessToken,
      refreshToken,
    });
  }
  async refreshToken(refreshToken: string): Promise<any> {
    const { userId } = this.jwtService.verify(refreshToken, {
      secret: jwtRefreshSecret.secret,
    });
    const user = await this.usersService.getUserById(userId);
    const accessToken = this.jwtService.sign(
      {
        userId: user.id,
      },
      {
        secret: jwtAccessSecret.secret,
        expiresIn: '1h',
      },
    );
    return plainToInstance(ResponseUserDto, {
      ...user,
      accessToken,
    });
  }
}
