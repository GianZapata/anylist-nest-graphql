import { Injectable, NotFoundException } from '@nestjs/common';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { ListItem } from './entities/list-item.entity';
import { ListsService } from '../lists/lists.service';
import { ItemsService } from '../items/items.service';
import { CreateListItemInput, UpdateListItemInput } from './dto';
import { List } from '../lists/entities/list.entity';
import { PaginationArgs } from '../common/dto/args/pagination.args';
import { SearchArgs } from '../common/dto/args/search.args';

@Injectable()
export class ListItemService {
  /*
   *  ListItemService needs ListsService and ItemsService to be able to create a new ListItem.
   *  This is because ListItem has a ManyToOne relationship with both List and Item.
   * We need to make sure that the List and Item exist before we create a new ListItem.
   * We can do this by injecting ListsService and ItemsService into ListItemService.
   */
  constructor(
    @InjectRepository(ListItem)
    private readonly listItemRepository: Repository<ListItem>,
    private readonly listsService: ListsService,
    private readonly itemsService: ItemsService,
  ) {}

  async create(createListItemInput: CreateListItemInput): Promise<ListItem> {
    const { itemId, listId, ...restOfListItem } = createListItemInput;
    const newListItem = this.listItemRepository.create({
      ...restOfListItem,
      item: { id: itemId },
      list: { id: listId },
    });

    await this.listItemRepository.save(newListItem);
    return this.findOne(newListItem.id);
  }

  async findAll(
    list: List,
    paginationArgs: PaginationArgs,
    searchArgs: SearchArgs,
  ): Promise<ListItem[]> {
    const { limit, offset } = paginationArgs;
    const { search } = searchArgs;

    const queryBuilder = await this.listItemRepository
      .createQueryBuilder()
      .take(limit)
      .skip(offset)
      .where(`"listId" = :listId`, { listId: list.id });

    if (search) {
      queryBuilder.andWhere(`LOWER("name") LIKE :name`, {
        name: `%${search.toLowerCase()}%`,
      });
    }
    return queryBuilder.getMany();
  }

  async findOne(id: string): Promise<ListItem> {
    const listItem = await this.listItemRepository.findOne({ where: { id } });
    if (!listItem)
      throw new NotFoundException(`List item with id ${id} not found`);
    return listItem;
  }

  async countListItemsByList(list: List): Promise<number> {
    return this.listItemRepository.count({ where: { list: { id: list.id } } });
  }

  async update(
    id: string,
    updateListItemInput: UpdateListItemInput,
  ): Promise<ListItem> {
    const { listId, itemId, ...restOfListItem } = updateListItemInput;

    const queryBuilder = this.listItemRepository
      .createQueryBuilder()
      .update()
      .set(restOfListItem)
      .where(`"id" = :id`, { id });

    if (listId) queryBuilder.set({ list: { id: listId } });
    if (itemId) queryBuilder.set({ item: { id: itemId } });

    await queryBuilder.execute();
    return this.findOne(id);
  }
}
