import { Field, ID, ObjectType } from '@nestjs/graphql';
import {
  BeforeInsert,
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { hashSync } from 'bcrypt';
import { Item } from '../../items/entities/item.entity';

@Entity({ name: 'users' })
@ObjectType()
export class User {
  @PrimaryGeneratedColumn('uuid')
  @Field(() => ID)
  id: string;

  @Column()
  @Field(() => String)
  fullName: string;

  @Column({
    unique: true,
  })
  @Field(() => String)
  email: string;

  @Column({ select: false })
  password: string;

  @Column({
    default: true,
    type: 'boolean',
  })
  @Field(() => Boolean)
  isActive: boolean;

  @Column({
    type: 'text',
    array: true,
    default: ['user'],
  })
  @Field(() => [String])
  roles: string[];

  // Timestamps
  @Column({
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP',
  })
  createdAt: Date;

  @Column({
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP',
    onUpdate: 'CURRENT_TIMESTAMP',
  })
  updatedAt: Date;

  @ManyToOne(() => User, (user) => user.lastUpdateBy, {
    nullable: true,
    lazy: true,
  })
  @JoinColumn({ name: 'lastUpdateBy' })
  @Field(() => User, { nullable: true })
  lastUpdateBy?: User;

  // Un usuario puede tener muchos items
  @OneToMany(() => Item, (item) => item.user, { lazy: true })
  @Field(() => [Item])
  items: Item[];

  @BeforeInsert()
  beforeInsertActions() {
    this.password = hashSync(this.password, 10);
  }
}
