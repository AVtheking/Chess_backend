import { HttpService } from '@nestjs/axios';
import {
  BadRequestException,
  HttpStatus,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { User } from '@prisma/client';
import { plainToInstance } from 'class-transformer';
import { Response } from 'express';

import { generateUsername } from 'unique-username-generator';
import { OtpService } from '../otp/otp.service';
import { UsersService } from '../users/users.service';
import { Mailer } from '../utils/Mailer';
import { Utils } from '../utils/utils';
import { jwtAccessSecret, jwtRefreshSecret, jwtResetSecret } from './constants';
import { ForgetPasswordDto } from './dto/forget-password.dto';
import { LoginUserDto } from './dto/login-user.dto';
import { CreateUserDto } from './dto/register-user.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { ResponseUserDto } from './dto/response-user.dto';
import { SignUpResponseDto } from './dto/signUp-respones.dto';
import { VerifyOtpDto } from './dto/verify-otp.dto';

interface googleUser {
  username: string;
  email: string;
  id: string;
}

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
    private otpService: OtpService,
    private httpService: HttpService,
    private utlis: Utils,
    private mailer: Mailer,
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
    const user = await this.usersService.createUser(signUp);

    if (!('email' in user)) {
      return;
    }
    const otp = await this.otpService.generateOtp(signUp.email);
    this.mailer.sendEmailVerificationMail(signUp.email, otp);

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
      throw new BadRequestException('OTP not found');
    }

    if (!this.otpService.checkExpiration(OTP)) {
      this.otpService.deleteOtp(email);

      throw new BadRequestException('OTP expired');
    }
    if (OTP.otp != otp) {
      throw new BadRequestException('Invalid OTP');
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
    const userData = this.utlis.userResponse(user);
    const responseData = plainToInstance(ResponseUserDto, {
      user: userData,
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
  async signIn(userData: LoginUserDto, res: Response): Promise<Response> {
    const user = await this.usersService.loginUser(userData);
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
    const userResponse = this.utlis.userResponse(user);

    const responseData = plainToInstance(ResponseUserDto, {
      user: userResponse,
      accessToken,
      refreshToken,
    });
    return this.utlis.sendHttpResponse(
      true,
      HttpStatus.OK,
      'User logged in',
      responseData,
      res,
    );
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
      throw new NotFoundException('User not found');
    }

    //generating the otp and sending it to mail
    const otp = await this.otpService.generateOtp(email);
    this.mailer.sendForgetPasswordMail(email, otp);

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

      throw new BadRequestException('OTP expired');
    }

    if (OTP.otp != otp) {
      throw new BadRequestException('Invalid OTP');
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
      throw new BadRequestException('Password is required');
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
   * Refreshes the access token of the user
   * @param refreshToken
   * @returns user
   */

  async refreshToken(res: Response, userId: string): Promise<Response> {
    console.log(userId);
    const accessToken = await this.generateToken(
      userId,
      jwtAccessSecret.secret,
      '10d',
    );

    const responseData = plainToInstance(ResponseUserDto, {
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

  /*
   * Exchanges the token
   * @param access_token
   * @param res
   * @returns user
   */
  async tokenExchange(access_token: string, res: Response) {
    const url = `https://www.googleapis.com/oauth2/v3/userinfo?access_token=${access_token}`;

    ///TODO: Add more error handling here
    const response = await this.httpService.axiosRef.get(url);

    const data = response.data;

    if (response.status === 200) {
      const randomNumber = this.utlis.randomInteger(1000, 9999);
      const user = {
        username: `${data.given_name.toLowerCase()}.${data.family_name.toLowerCase()}${randomNumber}`,
        email: data.email,
        id: data.sub,
      };

      return await this.googleSignIn(user, res);
    }
  }

  /*
   * Signs in the user using google
   * @param user
   * @param res
   * @returns response
   */
  async googleSignIn(user: googleUser, res: Response) {
    if (!user) {
      throw new BadRequestException('User not found');
    }
    const userExists = await this.usersService.getUserByEmail(user.email);
    const password = this.utlis.randomPassword();
    if (!userExists) {
      return await this.registerOauthUser(
        {
          email: user.email,
          username: user.username,
          password: password,
        },
        res,
      );
    }

    const accessToken = await this.generateToken(
      userExists.id,
      jwtAccessSecret.secret,
      '10d',
    );
    const refreshToken = await this.generateToken(
      userExists.id,
      jwtRefreshSecret.secret,
      '10d',
    );

    //exposing only necessary fields to the user
    //exluding password field from the response
    const userData = this.utlis.userResponse(userExists);
    const responseData = plainToInstance(ResponseUserDto, {
      user: userData,
      accessToken,
      refreshToken,
    });
    console.log('\x1b[32m', 'User logged in using google \x1b[1m');
    return await this.utlis.sendHttpResponse(
      true,
      HttpStatus.OK,
      'User logged in',
      responseData,
      res,
    );
  }

  /*
   * Registers the user
   * @param userData
   * @param res
   * @returns response
   */

  async registerOauthUser(userData: CreateUserDto, res: Response) {
    const newUser = await this.usersService.createUser(userData);
    const user = newUser as User;

    user.username = generateUsername(userData.username);
    user.verified = true;

    await this.usersService.updateUser(user.id, {
      username: user.username,
      verified: user.verified,
    });

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
    const userResponse = this.utlis.userResponse(user);
    const responseData = plainToInstance(ResponseUserDto, {
      user: { userResponse },
      accessToken,
      refreshToken,
    });
    return this.utlis.sendHttpResponse(
      true,
      HttpStatus.CREATED,
      'User created successfully',
      responseData,
      res,
    );
  }
}
