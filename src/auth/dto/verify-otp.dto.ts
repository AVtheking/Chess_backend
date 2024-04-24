import { IsDefined } from 'class-validator';

export class VerifyOtpDto {
  @IsDefined()
  email: string;
  @IsDefined()
  otp: number;
}
