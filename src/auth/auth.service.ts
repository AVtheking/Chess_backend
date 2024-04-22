import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { plainToInstance } from 'class-transformer';
import { UsersService } from 'src/users/users.service';
import { jwtAccessSecret, jwtRefreshSecret } from './constants';
import { LoginUserDto } from './dto/login-user.dto';
import { CreateUserDto } from './dto/register-user.dto';
import { ResponseUserDto } from './dto/response-user.dto';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
  ) {}

  //generate access token
  async generateAccessToken(userId: string): Promise<string> {
    return this.jwtService.sign(
      {
        userId,
      },
      {
        secret: jwtAccessSecret.secret,
        expiresIn: '1h',
      },
    );
  }

  //generate Refresh token
  async generateRefreshToken(userId: string): Promise<string> {
    return this.jwtService.sign(
      {
        userId,
      },
      {
        secret: jwtRefreshSecret.secret,
        expiresIn: '10d',
      },
    );
  }
  async signUp(signUp: CreateUserDto): Promise<ResponseUserDto> {
    const user = await this.usersService.createUser(signUp);
    const accessToken = await this.generateAccessToken(user.id);
    const refreshToken = await this.generateRefreshToken(user.id);

    return plainToInstance(ResponseUserDto, {
      ...user,
      accessToken,
      refreshToken,
    });
  }

  async signIn(userData: LoginUserDto): Promise<ResponseUserDto> {
    const user = await this.usersService.loginUser(userData);
    const accessToken = await this.generateAccessToken(user.id);
    const refreshToken = await this.generateRefreshToken(user.id);
    return plainToInstance(ResponseUserDto, {
      ...user,
      accessToken,
      refreshToken,
    });
  }

  //forget Password logic
  async forgetPassword(email: string): Promise<any>{
    
  }

  //refreshes the access token of the user
  async refreshToken(refreshToken: string): Promise<ResponseUserDto> {
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
