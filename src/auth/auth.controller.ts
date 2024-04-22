import { Body, Controller, Post } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginUserDto } from './dto/login-user.dto';
import { CreateUserDto } from './dto/register-user.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}
  @Post('SignUp')
  async SignUp(@Body() userData: CreateUserDto) {
    return await this.authService.signUp(userData);
  }

  @Post('SignIn')
  async SignIn(@Body() userData: LoginUserDto) {
    return await this.authService.signIn(userData);
  }

  @Post('RefreshToken')
  async RefreshToken(@Body() refreshToken: { refreshToken: string }) {
    return await this.authService.refreshToken(refreshToken.refreshToken);
  }
}
