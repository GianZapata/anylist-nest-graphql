import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Not, Repository } from 'typeorm';
import { hashSync } from 'bcrypt';
import { User } from './entities/user.entity';
import { SignupInput } from '../auth/dto/inputs/signup.input';
import { ValidRoles } from '../auth/enums/valid-roles.enum';
import { UpdateUserInput } from './dto';

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
      this.handleDBExceptions(error);
    }
  }

  async findAll(roles: ValidRoles[]): Promise<User[]> {
    if (roles.length === 0) return await this.userRepository.find();

    return this.userRepository
      .createQueryBuilder()
      .andWhere('ARRAY[roles] && ARRAY[:...roles]')
      .setParameter('roles', roles)
      .getMany();
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
      this.handleDBExceptions(error);
    }
  }

  async update(
    id: string,
    updateUserInput: UpdateUserInput,
    updateBy: User,
  ): Promise<User> {
    try {
      const userToUpdate = await this.userRepository.preload({
        id,
        ...updateUserInput,
        lastUpdateBy: updateBy,
      });
      if (!userToUpdate)
        throw new NotFoundException(`User with #${id} not found`);

      if (updateUserInput.email) {
        const userWithSameEmail = await this.userRepository.findOne({
          where: { email: updateUserInput.email, id: Not(id) },
        });
        if (userWithSameEmail)
          throw new BadRequestException(
            `The email ${updateUserInput.email} is already in use`,
          );
        userToUpdate.email = updateUserInput.email;
      }

      if (updateUserInput.password)
        userToUpdate.password = hashSync(updateUserInput.password, 10);

      return await this.userRepository.save(userToUpdate);
    } catch (error) {
      this.handleDBExceptions(error);
    }
  }

  async block(id: string, adminUser: User): Promise<User> {
    const userToBlock = await this.findOneById(id);
    userToBlock.isActive = false;
    userToBlock.lastUpdateBy = adminUser;
    return await this.userRepository.save(userToBlock);
  }

  private handleDBExceptions(error: any): never {
    this.logger.error(error);
    if (error.code === '23505') throw new BadRequestException(error.detail);

    switch (error.status) {
      case 400:
        throw new BadRequestException(error.message);
      case 403:
        throw new ForbiddenException(error.message);
      case 404:
        throw new NotFoundException(error.message);
      default:
        break;
    }

    throw new InternalServerErrorException(
      'Unexpected error, check server logs',
    );
  }
}
