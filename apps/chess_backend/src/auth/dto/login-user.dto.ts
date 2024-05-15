import { IsDefined, IsEmail } from 'class-validator';

export class LoginUserDto {
  @IsDefined()
  @IsEmail()
  email: string;

  @IsDefined()
  password: string;
}
