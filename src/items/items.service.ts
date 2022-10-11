import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateItemInput, UpdateItemInput } from './dto';
import { Item } from './entities/item.entity';

@Injectable()
export class ItemsService {
  constructor(
    @InjectRepository(Item)
    private readonly itemsRepository: Repository<Item>,
  ) {}

  async create(createItemInput: CreateItemInput): Promise<Item> {
    const newItem = this.itemsRepository.create(createItemInput);
    return await this.itemsRepository.save(newItem);
  }

  async findAll(): Promise<Item[]> {
    // TODO: Filtra, paginar, por usuario
    const items = this.itemsRepository.find();
    return items;
  }

  async findOne(id: string): Promise<Item> {
    const item = await this.itemsRepository.findOne({ where: { id } });
    if (!item) throw new NotFoundException(`Item #${id} not found`);
    return item;
  }

  async update(id: string, updateItemInput: UpdateItemInput): Promise<Item> {
    const itemToUpdate = await this.itemsRepository.preload(updateItemInput);
    if (!itemToUpdate) throw new NotFoundException(`Item #${id} not found`);
    return await this.itemsRepository.save(itemToUpdate);
  }

  async remove(id: string): Promise<Item> {
    // TODO: soft delete, no borrar de la base de datos
    const itemToRemove = await this.findOne(id);
    await this.itemsRepository.remove(itemToRemove);
    return { ...itemToRemove, id };
  }
}
