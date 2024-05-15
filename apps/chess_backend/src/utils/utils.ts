import { Injectable } from '@nestjs/common';
import { User } from '@prisma/client';
import { plainToInstance } from 'class-transformer';
import { Response } from 'express';
import {
  charsDigits,
  charsLowercase,
  charsSpecial,
  charsUppercase,
} from '../auth/constants';
import { UserDto } from '../auth/dto/response-user.dto';

@Injectable()
export class Utils {
  constructor() {}

  async sendHttpResponse(
    success: boolean,
    statusCode: number,
    message: string,
    data: any,
    res: Response,
  ) {
    return res.status(statusCode).json({
      success,
      message,
      data: {
        ...data,
      },
    });
  }
  randomPassword() {
    let password = '';
    for (let i = 0; i < 8; i++) {
      password += charsLowercase.charAt(
        Math.floor(Math.random() * charsLowercase.length),
      );
      password += charsUppercase.charAt(
        Math.floor(Math.random() * charsUppercase.length),
      );
      password += charsSpecial.charAt(
        Math.floor(Math.random() * charsSpecial.length),
      );
      password += charsDigits.charAt(
        Math.floor(Math.random() * charsDigits.length),
      );
    }

    return password;
  }
  randomInteger(min: number, max: number): number {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }
  userResponse(user: User): UserDto {
    const userResponse = plainToInstance(UserDto, {
      ...user,
    });
    return userResponse;
  }
}
