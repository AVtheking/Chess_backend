import { Body, Controller, Post, Res } from '@nestjs/common';
import { Response } from 'express';
import { AuthService } from './auth.service';
import { LoginUserDto } from './dto/login-user.dto';
import { CreateUserDto } from './dto/register-user.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}
  @Post('SignUp')
  async SignUp(@Body() userData: CreateUserDto, @Res() res: Response) {
    return await this.authService.signUp(userData, res);
  }

  @Post('SignIn')
  async SignIn(@Body() userData: LoginUserDto) {
    return await this.authService.signIn(userData);
  }
  @Post('verifyOtp')
  async verifyOtp(
    @Body() otpData: { email: string; otp: number },
    @Res() res: Response,
  ) {
    return await this.authService.verfiyOtp(otpData.email, otpData.otp, res);
  }

  @Post('forgetPassword')
  async forgetPassword(@Body('email') email: string, @Res() res: Response) {
    return await this.authService.forgetPassword(email, res);
  }
  @Post('RefreshToken')
  async RefreshToken(@Body() refreshToken: { refreshToken: string }) {
    return await this.authService.refreshToken(refreshToken.refreshToken);
  }
}
