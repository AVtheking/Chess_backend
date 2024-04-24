import {
  BadRequestException,
  HttpStatus,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { User } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import { Response } from 'express';
import { LoginUserDto } from 'src/auth/dto/login-user.dto';
import { CreateUserDto } from 'src/auth/dto/register-user.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { Utils } from 'src/utils/send-mail';

@Injectable()
export class UsersService {
  constructor(
    private prisma: PrismaService,
    private utils: Utils,
  ) {}

  //return the user which matches the id
  async getUserById(id: string): Promise<User> {
    return await this.prisma.user.findUnique({
      where: {
        id,
      },
    });
  }
  async hashPassword(password: string): Promise<string> {
    const saltOrRounds = 10;
    return await bcrypt.hash(password, saltOrRounds);
  }
  async createUser(
    data: CreateUserDto,
    res: Response,
  ): Promise<User | Response> {
    const { username, email, password } = data;

    //checking if the username already taken
    let user = await this.prisma.user.findUnique({
      where: {
        email,
      },
    });
    if (user) {
      if (!user.verified) {
        await this.updateUser(user.id, {
          ...data,
        });
      } else {
        return this.utils.sendHttpResponse(
          false,
          HttpStatus.CONFLICT,
          'Email already registered',
          null,
          res,
        );
      }
    } else {
      user = await this.prisma.user.findUnique({
        where: {
          username,
        },
      });
      if (user) {
        return this.utils.sendHttpResponse(
          false,
          HttpStatus.CONFLICT,
          'Username already taken',
          null,
          res,
        );
      }

      const hashedPassword = await this.hashPassword(password);

      //creating the user and storing it in db
      return this.prisma.user.create({
        data: {
          username,
          email,
          password: hashedPassword,
        },
      });
    }
  }
  async updateUser(id: string, data: CreateUserDto): Promise<User> {
    const { username, email, password } = data;

    return await this.prisma.user.update({
      where: {
        id,
      },
      data: {
        username,
        email,
        password,
      },
    });
  }
  async updateUserVerificationStatus(id: string): Promise<User> {
    return await this.prisma.user.update({
      where: {
        id,
      },
      data: {
        verified: true,
      },
    });
  }
  async updateUserPassword(id: string, password: string): Promise<User> {
    const hashedPassword = await this.hashPassword(password);
    return await this.prisma.user.update({
      where: {
        id,
      },
      data: {
        password: hashedPassword,
      },
    });
  }

  async loginUser(
    userData: LoginUserDto,
    res: Response,
  ): Promise<User | Response> {
    const { email, password } = userData;
    const user = await this.prisma.user.findUnique({
      where: {
        email,
      },
    });
    if (!user) {
      throw new NotFoundException('User not found');
    }
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      // throw new UnauthorizedException('Invalid password');
      return this.utils.sendHttpResponse(
        false,
        HttpStatus.UNAUTHORIZED,
        'Invalid password',
        null,
        res,
      );
    }
    return user;
  }
  async getUserByEmail(email: string): Promise<User> {
    if (!email) throw new BadRequestException('Email is required');
    return await this.prisma.user.findUnique({
      where: {
        email,
      },
    });
  }
}
