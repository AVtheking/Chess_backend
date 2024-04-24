import { Body, Controller, Post, Req, Res, UseGuards } from '@nestjs/common';
import { Response } from 'express';
import { AuthService } from './auth.service';
import { ForgetPasswordDto } from './dto/forget-password.dto';
import { LoginUserDto } from './dto/login-user.dto';
import { CreateUserDto } from './dto/register-user.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { VerifyOtpDto } from './dto/verify-otp.dto';
import { ResetPasswordGuard } from './reset_password.guard';

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
  @Post('RefreshToken')
  async RefreshToken(
    @Body() refreshToken: { refreshToken: string },
    @Res() res: Response,
  ) {
    return await this.authService.refreshToken(refreshToken.refreshToken, res);
  }
}
