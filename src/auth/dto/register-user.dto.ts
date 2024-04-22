import {
  IsAlphanumeric,
  IsDefined,
  IsEmail,
  IsString,
  Length,
} from 'class-validator';

export class CreateUserDto {
  @IsString()
  @IsDefined()
  username: string;

  @IsString()
  @IsEmail()
  @IsDefined()
  email: string;

  @IsAlphanumeric()
  @IsDefined()
  @Length(8, 20)
  password: string;
}
