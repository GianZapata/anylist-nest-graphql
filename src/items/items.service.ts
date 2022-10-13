import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Item } from './entities/item.entity';
import { User } from '../users/entities/user.entity';
import { CreateItemInput, UpdateItemInput } from './dto';
import { PaginationArgs, SearchArgs } from '../common/dto/args';

@Injectable()
export class ItemsService {
  constructor(
    @InjectRepository(Item)
    private readonly itemsRepository: Repository<Item>,
  ) {}

  async create(createItemInput: CreateItemInput, user: User): Promise<Item> {
    const newItem = this.itemsRepository.create({ ...createItemInput, user });
    return await this.itemsRepository.save(newItem);
  }

  async findAll(
    user: User,
    paginationArgs: PaginationArgs,
    searchArgs: SearchArgs,
  ): Promise<Item[]> {
    const { limit, offset } = paginationArgs;
    const { search } = searchArgs;

    const queryBuilder = await this.itemsRepository
      .createQueryBuilder()
      .take(limit)
      .skip(offset)
      .where(`"userId" = :userId`, { userId: user.id });

    if (search) {
      queryBuilder.andWhere(`LOWER("name") LIKE :name`, {
        name: `%${search.toLowerCase()}%`,
      });
    }

    // const items = await this.itemsRepository.find({
    //   where: { user: { id: user.id }, name: Like(`%${search}%`) },
    //   take: limit,
    //   skip: offset,
    // });
    return queryBuilder.getMany();
  }

  async findOne(id: string, user: User): Promise<Item> {
    const item = await this.itemsRepository.findOne({
      where: {
        id,
        user: {
          id: user.id,
        },
      },
    });
    if (!item) throw new NotFoundException(`Item #${id} not found`);
    return item;
  }

  async update(
    id: string,
    updateItemInput: UpdateItemInput,
    user: User,
  ): Promise<Item> {
    await this.findOne(id, user);
    const itemToUpdate = await this.itemsRepository.preload(updateItemInput);
    if (!itemToUpdate) throw new NotFoundException(`Item #${id} not found`);
    return await this.itemsRepository.save(itemToUpdate);
  }

  async remove(id: string, user: User): Promise<Item> {
    const itemToRemove = await this.findOne(id, user);
    await this.itemsRepository.remove(itemToRemove);
    return { ...itemToRemove, id };
  }

  async itemCountByUser(user: User): Promise<number> {
    return await this.itemsRepository.count({
      where: { user: { id: user.id } },
    });
  }
}
