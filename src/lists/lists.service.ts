import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateListInput, UpdateListInput } from './dto';
import { PaginationArgs } from '../common/dto/args/pagination.args';
import { List } from './entities/list.entity';
import { User } from '../users/entities/user.entity';
import { SearchArgs } from '../common/dto/args/search.args';

@Injectable()
export class ListsService {
  constructor(
    @InjectRepository(List)
    private readonly listsRepository: Repository<List>,
  ) {}

  async create(createListInput: CreateListInput, user: User): Promise<List> {
    const newList = this.listsRepository.create({ ...createListInput, user });
    return await this.listsRepository.save(newList);
  }

  async findAll(
    user: User,
    paginationArgs: PaginationArgs,
    searchArgs: SearchArgs,
  ): Promise<List[]> {
    const { limit, offset } = paginationArgs;
    const { search } = searchArgs;
    const queryBuilder = await this.listsRepository
      .createQueryBuilder()
      .take(limit)
      .skip(offset)
      .where(`"userId" = :userId`, { userId: user.id });
    if (search) {
      queryBuilder.andWhere(`LOWER("name") LIKE :name`, {
        name: `%${search.toLowerCase()}%`,
      });
    }
    return queryBuilder.getMany();
  }

  async findOne(id: string, user: User): Promise<List> {
    const list = await this.listsRepository.findOne({
      where: {
        id,
        user: {
          id: user.id,
        },
      },
    });
    if (!list) throw new NotFoundException(`List #${id} not found`);
    return list;
  }

  async update(
    id: string,
    updateListInput: UpdateListInput,
    user,
  ): Promise<List> {
    await this.findOne(id, user);
    const listToUpdate = await this.listsRepository.preload(updateListInput);
    if (!listToUpdate) throw new NotFoundException(`List #${id} not found`);
    return await this.listsRepository.save(listToUpdate);
  }

  async remove(id: string, user: User): Promise<List> {
    const listToRemove = await this.findOne(id, user);
    await this.listsRepository.remove(listToRemove);
    return { ...listToRemove, id };
  }

  async listCountByUser(user: User): Promise<number> {
    return await this.listsRepository.count({
      where: { user: { id: user.id } },
    });
  }
}
