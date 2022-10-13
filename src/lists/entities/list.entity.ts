import { Field, ObjectType, ID } from '@nestjs/graphql';
import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { ListItem } from '../../list-item/entities/list-item.entity';

@ObjectType()
@Entity('lists')
export class List {
  @PrimaryGeneratedColumn('uuid')
  @Field(() => ID)
  id: string;

  @Column()
  @Field(() => String)
  name: string;

  // Muchas listas pueden pertenecer a un solo usuario
  @ManyToOne(() => User, (user) => user.lists, { nullable: false, lazy: true })
  @Index('list-userId-index')
  @Field(() => User)
  user: User;

  @CreateDateColumn({ name: 'createdAt', type: 'timestamp', precision: 3 })
  @Field(() => Date)
  createdAt: Date;

  @UpdateDateColumn({ name: 'updatedAt', type: 'timestamp', precision: 3 })
  @Field(() => Date)
  updatedAt: Date;

  // Una lista puede tener muchos list item, pero un list item solo puede pertenecer a una lista de compras
  @OneToMany(() => ListItem, (listItem) => listItem.list, { lazy: true })
  // @Field(() => [ListItem])
  listItem: ListItem[];
}
