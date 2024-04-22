import { Expose } from 'class-transformer';

export class ResponseUserDto {
  @Expose()
  username: string;

  @Expose()
  id: number;

  @Expose()
  email: string;

  @Expose()
  createdAt: Date;

  @Expose()
  updatedAt: Date;
  @Expose()
  accessToken: string;

  @Expose()
  refreshToken: string;
}
