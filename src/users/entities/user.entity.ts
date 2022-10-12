import { Field, ID, ObjectType } from '@nestjs/graphql';
import { BeforeInsert, Column, Entity, PrimaryGeneratedColumn } from 'typeorm';
import { hashSync } from 'bcrypt';

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

  @Column()
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

  @BeforeInsert()
  beforeInsertActions() {
    this.password = hashSync(this.password, 10);
  }
}
