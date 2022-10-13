import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ListItemService } from './list-item.service';
import { ListItemResolver } from './list-item.resolver';
import { ListItem } from './entities/list-item.entity';
import { ListsModule } from '../lists/lists.module';
import { ItemsModule } from '../items/items.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([ListItem]),
    forwardRef(() => ListsModule),
    forwardRef(() => ItemsModule),
  ],
  providers: [ListItemResolver, ListItemService],
  exports: [ListItemService, TypeOrmModule],
})
export class ListItemModule {}
