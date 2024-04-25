import {
  Body,
  Controller,
  Get,
  Post,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import { Response } from 'express';
import { AuthService } from './auth.service';
import { ForgetPasswordDto } from './dto/forget-password.dto';
import { LoginUserDto } from './dto/login-user.dto';
import { CreateUserDto } from './dto/register-user.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { VerifyOtpDto } from './dto/verify-otp.dto';
import { AuthGuard } from './guards/auth.guard';
import { RefreshTokenGuard } from './guards/refresh-token.guard';
import { ResetPasswordGuard } from './guards/reset-password.guard';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('SignUp')
  async SignUp(@Body() userData: CreateUserDto, @Res() res: Response) {
    return await this.authService.signUp(userData, res);
  }
  @Post('verfiyEmail')
  async verifyEmail(@Body() data: VerifyOtpDto, @Res() res: Response) {
    return await this.authService.verifyEmail(data, res);
  }

  @Post('SignIn')
  async SignIn(@Body() userData: LoginUserDto, @Res() res: Response) {
    return await this.authService.signIn(userData, res);
  }

  @Post('forgetPassword')
  async forgetPassword(@Body() data: ForgetPasswordDto, @Res() res: Response) {
    return await this.authService.forgetPassword(data, res);
  }
  @Post('verifyOtp')
  async verifyOtp(@Body() otpData: VerifyOtpDto, @Res() res: Response) {
    return await this.authService.verfiyOtp(otpData, res);
  }

  @UseGuards(ResetPasswordGuard)
  @Post('changePassword')
  async changePassword(
    @Body() resetData: ResetPasswordDto,
    @Res() res: Response,
    @Req() req: any,
  ) {
    return await this.authService.changePassword(resetData, res, req.user);
  }

  @UseGuards(AuthGuard)
  @Get('profile')
  async getProfile(@Req() req: any) {
    console.log('User is authenticated');
    return req.user;
  }
  @UseGuards(RefreshTokenGuard)
  @Post('refreshToken')
  async RefreshToken(@Req() req: any, @Res() res: Response) {
    const userId = req.user;
    return await this.authService.refreshToken(res, userId);
  }
}
