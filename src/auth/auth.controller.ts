import { Body, Controller, Post } from '@nestjs/common';
import { AuthService } from './auth.service';
import { CreateUserDto } from './dto/register-user.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}
  @Post('SignUp')
  async SignUp(@Body() userData: CreateUserDto) {
    return await this.authService.signUp(userData);
  }

  @Post('RefreshToken')
  async RefreshToken(@Body() refreshToken: { refreshToken: string }) {
    return await this.authService.refreshToken(refreshToken.refreshToken);
  }
}
