import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../users/entities/user.entity';
import { Item } from '../items/entities/item.entity';
import { ConfigService } from '@nestjs/config';
import { SEED_USERS, SEED_ITEMS } from './data/seed-data';
import { UsersService } from '../users/users.service';
import { getRandomKeyFromArray } from '../common/helpers/get-random-key-from-array.helper';
import { ItemsService } from '../items/items.service';

@Injectable()
export class SeedService {
  private isProd: boolean;

  constructor(
    private readonly configService: ConfigService,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Item)
    private readonly itemRepository: Repository<Item>,

    private readonly usersService: UsersService,
    private readonly itemsService: ItemsService,
  ) {
    this.isProd = this.configService.get('NODE_ENV') === 'production';
  }

  async populateDB(): Promise<boolean> {
    if (this.isProd)
      throw new Error('No se puede ejecutar el seed en producción');

    await this.deleteDatabase();
    await this.createTables();
    return true;
  }

  async deleteDatabase(): Promise<boolean> {
    // Eliminar items
    await this.itemRepository.createQueryBuilder().delete().where({}).execute();

    // Eliminar usuarios
    await this.userRepository.createQueryBuilder().delete().where({}).execute();
    return true;
  }

  async createTables(): Promise<boolean> {
    // Crear usuarios
    const users = await this.loadUsers();

    // Crear items
    await this.loadItems(users);
    return true;
  }

  async loadUsers(): Promise<User[]> {
    const userPromises = [];

    for (const user of SEED_USERS) {
      userPromises.push(this.usersService.create(user));
    }

    return await Promise.all(userPromises);
  }

  async loadItems(users: User[]): Promise<User[]> {
    const itemsPromises = [];
    for (let i = 0; i < 2; i++) {
      for (const item of SEED_ITEMS) {
        const user = getRandomKeyFromArray(users);
        itemsPromises.push(
          this.itemsService.create(
            {
              name: item.name,
              quantityUnits: item.quantityUnits,
            },
            user,
          ),
        );
      }
    }
    return await Promise.all(itemsPromises);
  }
}
