import { IsDefined, IsEmail } from 'class-validator';

export class ForgetPasswordDto {
  @IsDefined()
  @IsEmail()
  email: string;
}
