import { Exclude, Expose } from 'class-transformer';
export class UserDto {
  @Expose()
  username: string;

  @Expose()
  id: number;

  @Expose()
  email: string;

  @Exclude()
  password: string;

  @Expose()
  createdAt: Date;

  @Expose()
  updatedAt: Date;
}

export class ResponseUserDto {
  @Expose()
  user: UserDto;
  @Expose()
  accessToken: string;

  @Expose()
  refreshToken: string;
}
