import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { UpdateUserInput } from './dto/update-user.input';
import { User } from './entities/user.entity';
import { SignupInput } from '../auth/dto/inputs/signup.input';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { NotFoundException } from '@nestjs/common';

@Injectable()
export class UsersService {
  private logger = new Logger('UsersService');

  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async create(signupInput: SignupInput): Promise<User> {
    try {
      const newUser = this.userRepository.create(signupInput);

      return await this.userRepository.save(newUser);
    } catch (error) {
      this.handleDBException(error);
    }
  }

  async findAll(): Promise<User[]> {
    return [];
  }

  async findOneByEmail(email: string): Promise<User> {
    try {
      return await this.userRepository.findOneOrFail({ where: { email } });
    } catch (error) {
      throw new NotFoundException(`User with email ${email} not found`);
    }
  }
  async findOneById(id: string): Promise<User> {
    try {
      return await this.userRepository.findOneOrFail({ where: { id } });
    } catch (error) {
      throw new NotFoundException(`User with #${id} not found`);
    }
  }

  async findOne(id: string): Promise<User> {
    try {
      return this.userRepository.findOneOrFail({ where: { id } });
    } catch (error) {
      this.handleDBException(error);
    }
  }

  async update(id: number, updateUserInput: UpdateUserInput) {
    return `This action updates a #${id} user`;
  }

  async block(id: string): Promise<User> {
    throw new Error('Block Method not implemented.');
  }

  private handleDBException(error: any): never {
    this.logger.error(error);
    if (error.code === '23505')
      throw new BadRequestException(error.detail.replace('Key', ''));

    if (error.code === 'error-001') throw new BadRequestException(error.detail);

    throw new InternalServerErrorException(`Check server logs for details`);
  }
}
