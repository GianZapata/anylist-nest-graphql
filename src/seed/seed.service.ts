import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ConfigService } from '@nestjs/config';
import { Repository } from 'typeorm';
import { User } from '../users/entities/user.entity';
import { Item } from '../items/entities/item.entity';
import { List } from '../lists/entities/list.entity';
import { ListItem } from '../list-item/entities/list-item.entity';
import { UsersService } from '../users/users.service';
import { ItemsService } from '../items/items.service';
import { ListsService } from '../lists/lists.service';
import { ListItemService } from '../list-item/list-item.service';
import { getRandomKeyFromArray } from '../common/helpers/get-random-key-from-array.helper';
import { SEED_USERS, SEED_ITEMS, SEED_LISTS } from './data/seed-data';

@Injectable()
export class SeedService {
  private isProd: boolean;

  constructor(
    private readonly configService: ConfigService,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,

    @InjectRepository(Item)
    private readonly itemRepository: Repository<Item>,

    @InjectRepository(List)
    private readonly listRepository: Repository<List>,

    @InjectRepository(ListItem)
    private readonly listItemRepository: Repository<ListItem>,

    private readonly usersService: UsersService,
    private readonly itemsService: ItemsService,
    private readonly listsService: ListsService,
    private readonly listItemsService: ListItemService,
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
    // Eliminar List Items
    await this.listItemRepository
      .createQueryBuilder()
      .delete()
      .where({})
      .execute();
    // Eliminar Lists
    await this.listRepository.createQueryBuilder().delete().where({}).execute();

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
    const items = await this.loadItems(users);

    // Crear Lists
    const lists = await this.loadLists(users);

    // Crear List Items
    await this.loadListItems(lists, items);
    return true;
  }

  async loadListItems(lists: List[], items: Item[]): Promise<ListItem[]> {
    const listItemPromises: Promise<ListItem>[] = [];

    for (const item of items) {
      const list = getRandomKeyFromArray(lists);
      const listItemInput = {
        itemId: item.id,
        listId: list.id,
        quantity: Math.floor(Math.random() * 25) + 1,
        completed: Boolean(Math.round(Math.random() * 1)),
      };
      this.listItemsService.create(listItemInput);
    }

    return await Promise.all(listItemPromises);
  }

  async loadLists(users: User[]): Promise<List[]> {
    const listPromises: Promise<List>[] = [];

    for (let i = 0; i < 2; i++) {
      for (const list of SEED_LISTS) {
        const user = getRandomKeyFromArray(users);
        listPromises.push(this.listsService.create(list, user));
      }
    }

    return await Promise.all(listPromises);
  }

  async loadUsers(): Promise<User[]> {
    const userPromises: Promise<User>[] = [];

    for (const user of SEED_USERS) {
      userPromises.push(this.usersService.create(user));
    }

    return await Promise.all(userPromises);
  }

  async loadItems(users: User[]): Promise<Item[]> {
    const itemsPromises: Promise<Item>[] = [];
    for (let i = 0; i < 2; i++) {
      for (const item of SEED_ITEMS) {
        const user = getRandomKeyFromArray(users);
        itemsPromises.push(this.itemsService.create(item, user));
      }
    }
    return await Promise.all(itemsPromises);
  }
}
