import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ListItemModule } from '../list-item/list-item.module';
import { ListsService } from './lists.service';
import { ListsResolver } from './lists.resolver';
import { List } from './entities/list.entity';

@Module({
  imports: [TypeOrmModule.forFeature([List]), ListItemModule],
  exports: [TypeOrmModule, ListsService],
  providers: [ListsResolver, ListsService],
})
export class ListsModule {}
