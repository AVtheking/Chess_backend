import { Expose } from 'class-transformer';

export class SignUpResponseDto {
  @Expose()
  username: string;
  @Expose()
  email: string;
}
