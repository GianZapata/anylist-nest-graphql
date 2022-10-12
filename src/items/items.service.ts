import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateItemInput, UpdateItemInput } from './dto';
import { Item } from './entities/item.entity';
import { User } from '../users/entities/user.entity';

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

  async findAll(user: User): Promise<Item[]> {
    const items = await this.itemsRepository.find({
      where: { user: { id: user.id } },
    });
    return items;
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
    // TODO: soft delete, no borrar de la base de datos
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
