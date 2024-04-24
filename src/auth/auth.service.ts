import { HttpStatus, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { plainToInstance } from 'class-transformer';
import { Response } from 'express';
import { AppService } from 'src/app.service';
import { OtpService } from 'src/otp/otp.service';
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
    private otpService: OtpService,
    private appService: AppService,
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
  async signUp(signUp: CreateUserDto, res: Response): Promise<any> {
    await this.usersService.createUser(signUp, res);
    const otp = await this.otpService.generateOtp(signUp.email);
    const emailSubject = 'Email Verification Otp';
    const text = `Your OTP is ${otp}`;
    const html = `<b>Your OTP is ${otp}</b>`;
    this.appService.sendMail(signUp.email, otp, emailSubject, text, html);
    return res.status(HttpStatus.CREATED).json({
      success: true,
      message: 'User created successfully',
      data: {
        username: signUp.username,
        email: signUp.email,
      },
    });
  }
  async verifyEmail(
    email: string,
    otp: number,
    res: Response,
  ): Promise<Response> {
    const OTP = await this.otpService.getOtp(email);
    if (OTP.otp != otp) {
      return res.status(HttpStatus.BAD_REQUEST).json({
        success: false,
        message: 'Invalid OTP',
      });
    }
    await this.otpService.deleteOtp(email);
    const user = await this.usersService.getUserByEmail(email);
    const accessToken = await this.generateAccessToken(user.id);
    const refreshToken = await this.generateRefreshToken(user.id);
    const responseData = plainToInstance(ResponseUserDto, {
      ...user,
      accessToken,
      refreshToken,
    });
    return res.status(HttpStatus.OK).json({
      success: true,
      message: 'OTP verified',
      data: responseData,
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

  async forgetPassword(email: string, res: Response) {
    if (!email) {
      return res.status(HttpStatus.BAD_REQUEST).json({
        success: false,
        message: 'Email is required',
      });
    }
    const user = await this.usersService.getUserByEmail(email);
    if (!user) {
      return res.status(HttpStatus.NOT_FOUND).json({
        success: false,
        message: 'User not found',
      });
    }
    await this.otpService.generateOtp(email);
    return res.status(HttpStatus.OK).json({
      success: true,
      message: 'OTP sent to your email',
    });
  }
  async verfiyOtp(email: string, otp: number, res: Response) {
    const OTP = await this.otpService.getOtp(email);
    if (OTP.otp != otp) {
      return res.status(HttpStatus.BAD_REQUEST).json({
        success: false,
        message: 'Invalid OTP',
      });
    }
    await this.otpService.deleteOtp(email);
    const user = await this.usersService.getUserByEmail(email);
    const accessToken = await this.generateAccessToken(user.id);
    const refreshToken = await this.generateRefreshToken(user.id);
    return res.status(HttpStatus.OK).json({
      success: true,
      message: 'OTP verified',
      accessToken,
      refreshToken,
    });
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
