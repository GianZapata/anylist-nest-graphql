import {
  Injectable,
  BadRequestException,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { compareSync } from 'bcrypt';
import { UsersService } from '../users/users.service';
import { SignupInput, AuthResponse, LoginInput } from './dto';
import { User } from '../users/entities/user.entity';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
  ) {}

  async signup(signupInput: SignupInput): Promise<AuthResponse> {
    const user = await this.usersService.create(signupInput);
    return this.revalidateToken(user);
  }

  async login({ email, password }: LoginInput): Promise<AuthResponse> {
    const user = await this.usersService.findOneByEmailWithPassword(email);

    if (!compareSync(password, user.password))
      throw new BadRequestException('Invalid credentials');

    return this.revalidateToken(user);
  }

  async validateUser(id: string): Promise<User> {
    const user = await this.usersService.findOneById(id);

    if (!user.isActive)
      throw new UnauthorizedException(`User is inactive, talk with an admin`);

    delete user.password;
    return user;
  }

  private getJWTToken(userId: string) {
    return this.jwtService.sign({ id: userId });
  }

  revalidateToken(user: User): AuthResponse {
    const token = this.getJWTToken(user.id);
    delete user.password;
    return {
      token,
      user,
    };
  }
}
