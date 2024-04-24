import { HttpStatus, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { plainToInstance } from 'class-transformer';
import { Response } from 'express';
import { OtpService } from 'src/otp/otp.service';
import { UsersService } from 'src/users/users.service';
import { Utils } from 'src/utils/send-mail';
import { jwtAccessSecret, jwtRefreshSecret, jwtResetSecret } from './constants';
import { ForgetPasswordDto } from './dto/forget-password.dto';
import { LoginUserDto } from './dto/login-user.dto';
import { CreateUserDto } from './dto/register-user.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { ResponseUserDto } from './dto/response-user.dto';
import { SignUpResponseDto } from './dto/signUp-respones.dto';
import { VerifyOtpDto } from './dto/verify-otp.dto';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
    private otpService: OtpService,
    private utlis: Utils,
  ) {}

  /*
   * Generates token
   * @param userId
   * @param secret
   * @param expiresIn
   * @returns token
   */
  async generateToken(
    userId: string,
    secret: string,
    expiresIn: string,
  ): Promise<string> {
    return this.jwtService.sign(
      {
        userId,
      },
      {
        secret,
        expiresIn,
      },
    );
  }

  /*
   * Registers the user
   * @param signUp
   * @param res
   * @returns response
   */
  async signUp(signUp: CreateUserDto, res: Response): Promise<any> {
    const user = await this.usersService.createUser(signUp, res);

    if (!('email' in user)) {
      return;
    }
    const otp = await this.otpService.generateOtp(signUp.email);
    this.utlis.sendEmailVerificationMail(signUp.email, otp);

    const responseData = plainToInstance(SignUpResponseDto, {
      username: signUp.username,
      email: signUp.email,
    });

    return this.utlis.sendHttpResponse(
      true,
      HttpStatus.CREATED,
      'User created successfully',
      responseData,
      res,
    );
  }
  /*
   * Verifies the email
   * @param email
   * @param otp
   * @param res
   * @returns response
   */
  async verifyEmail(data: VerifyOtpDto, res: Response): Promise<Response> {
    const { email, otp } = data;

    const OTP = await this.otpService.getOtp(email);
    if (!OTP) {
      return this.utlis.sendHttpResponse(
        false,
        HttpStatus.BAD_REQUEST,
        'OTP not found',
        null,
        res,
      );
    }

    if (!this.otpService.checkExpiration(OTP)) {
      this.otpService.deleteOtp(email);

      return this.utlis.sendHttpResponse(
        false,
        HttpStatus.BAD_REQUEST,
        'OTP expired',
        null,
        res,
      );
    }
    if (OTP.otp != otp) {
      return this.utlis.sendHttpResponse(
        false,
        HttpStatus.BAD_REQUEST,
        'Invalid OTP',
        null,
        res,
      );
    }

    //deleting the otp after being used
    await this.otpService.deleteOtp(email);

    //find user by email from usersService
    let user = await this.usersService.getUserByEmail(email);

    //updates the verified field of the user
    user = await this.usersService.updateUserVerificationStatus(user.id);
    const accessToken = await this.generateToken(
      user.id,
      jwtAccessSecret.secret,
      '1h',
    );
    const refreshToken = await this.generateToken(
      user.id,
      jwtRefreshSecret.secret,
      '10d',
    );
    const responseData = plainToInstance(ResponseUserDto, {
      ...user,
      accessToken,
      refreshToken,
    });

    return this.utlis.sendHttpResponse(
      true,
      HttpStatus.OK,
      'OTP verified',
      responseData,
      res,
    );
  }

  /*
   * Signs in the user
   * @param userData
   * @returns user
   */
  async signIn(
    userData: LoginUserDto,
    res: Response,
  ): Promise<ResponseUserDto> {
    const user = await this.usersService.loginUser(userData, res);
    if (!('id' in user)) {
      return;
    }
    const accessToken = await this.generateToken(
      user.id,
      jwtAccessSecret.secret,
      '1h',
    );
    const refreshToken = await this.generateToken(
      user.id,
      jwtRefreshSecret.secret,
      '10d',
    );
    return plainToInstance(ResponseUserDto, {
      ...user,
      accessToken,
      refreshToken,
    });
  }

  /*
    & Forgets the password
   * @param email
   * @param res
   * @returns response
   */
  async forgetPassword(data: ForgetPasswordDto, res: Response) {
    const email = data.email;

    const user = await this.usersService.getUserByEmail(email);
    if (!user) {
      return this.utlis.sendHttpResponse(
        false,
        HttpStatus.NOT_FOUND,
        'User not found',
        null,
        res,
      );
    }

    //generating the otp and sending it to mail
    const otp = await this.otpService.generateOtp(email);
    this.utlis.sendForgetPasswordMail(email, otp);

    return this.utlis.sendHttpResponse(
      true,
      HttpStatus.OK,
      'OTP sent to your email',
      null,
      res,
    );
  }

  /*
   * Verifies the OTP
   * @param otpData
   * @param res
   * @returns response
   */
  async verfiyOtp(otpData: VerifyOtpDto, res: Response) {
    const { email, otp } = otpData;
    const OTP = await this.otpService.getOtp(email);

    //checking if the token is expired or not
    if (!this.otpService.checkExpiration(OTP)) {
      this.otpService.deleteOtp(email);

      return this.utlis.sendHttpResponse(
        false,
        HttpStatus.BAD_REQUEST,
        'OTP expired',
        null,
        res,
      );
    }

    if (OTP.otp != otp) {
      return this.utlis.sendHttpResponse(
        false,
        HttpStatus.BAD_REQUEST,
        'Invalid OTP',
        null,
        res,
      );
    }

    //deleting the otp after it is verified
    await this.otpService.deleteOtp(email);
    const user = await this.usersService.getUserByEmail(email);

    //generating the token to reset password
    const token = await this.generateToken(
      user.id,
      jwtResetSecret.secret,
      '1h',
    );

    return this.utlis.sendHttpResponse(
      true,
      HttpStatus.OK,
      'OTP verified',
      { token },
      res,
    );
  }

  /*
   * Changes the password
   * @param password
   * @param res
   * @param userId
   * @returns response
   */
  async changePassword(
    password: ResetPasswordDto,
    res: Response,
    userId: string,
  ): Promise<Response> {
    if (!password) {
      return this.utlis.sendHttpResponse(
        false,
        HttpStatus.BAD_REQUEST,
        'Password is required',
        null,
        res,
      );
    }

    const hashedPassword = await this.usersService.hashPassword(
      password.password,
    );
    await this.usersService.updateUserPassword(userId, hashedPassword);

    return this.utlis.sendHttpResponse(
      true,
      HttpStatus.OK,
      'Password changed successfully',
      null,
      res,
    );
  }

  /*
   * Refreshes the token
   * @param refreshToken
   * @returns user
   */
  //refreshes the access token of the user
  async refreshToken(refreshToken: string, res: Response): Promise<Response> {
    const { userId } = this.jwtService.verify(refreshToken, {
      secret: jwtRefreshSecret.secret,
    });
    const user = await this.usersService.getUserById(userId);
    const accessToken = this.generateToken(
      userId,
      jwtAccessSecret.secret,
      '1h',
    );
    const responseData = plainToInstance(ResponseUserDto, {
      ...user,
      accessToken,
    });
    return this.utlis.sendHttpResponse(
      true,
      HttpStatus.OK,
      'Token refreshed',
      responseData,
      res,
    );
  }
}
