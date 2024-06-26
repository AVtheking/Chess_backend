import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { User } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import { Response } from 'express';
import { LoginUserDto } from 'src/auth/dto/login-user.dto';
import { CreateUserDto } from 'src/auth/dto/register-user.dto';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

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
  async createUser(data: CreateUserDto): Promise<User | Response> {
    const { username, email, password } = data;
    console.log(data);
    //checking if the username already taken
    let user = await this.prisma.user.findUnique({
      where: {
        email,
      },
    });

    if (user) {
      if (!user.verified) {
        return await this.updateUser(user.id, { username, email });
      } else {
        throw new ConflictException('Email already registered');
      }
    } else {
      user = await this.prisma.user.findUnique({
        where: {
          username,
        },
      });
      if (user) {
        throw new ConflictException('Username already taken');
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

  async updateUser(id: string, data: any): Promise<User> {
    return await this.prisma.user.update({
      where: {
        id,
      },
      data: {
        ...data,
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

  async loginUser(userData: LoginUserDto): Promise<User | Response> {
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
      throw new UnauthorizedException('Invalid password');
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
