import {
  ConflictException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { User } from '@prisma/client';
import * as bcrypt from 'bcrypt';
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
  async createUser(data: CreateUserDto): Promise<User> {
    const { username, email, password } = data;

    //checking if the username already taken
    let user = await this.prisma.user.findUnique({
      where: {
        username,
      },
    });
    if (user) {
      throw new ConflictException('Username already exists');
    }

    //checking if the email already taken
    user = await this.prisma.user.findUnique({
      where: {
        email,
      },
    });
    if (user) {
      throw new ConflictException('Email already registered');
    }
    const saltOrRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltOrRounds);

    //creating the user and storing it in db
    return await this.prisma.user.create({
      data: {
        username,
        email,
        password: hashedPassword,
      },
    });
  }

  async loginUser(userData: LoginUserDto): Promise<User> {
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
  async forgetPassword(email: string): Promise<any> {
    const user = await this.prisma.user.findUnique({
      where: {
        email,
      },
    });
    if (!user) {
      throw new NotFoundException('User not found');
    }
  }
}
