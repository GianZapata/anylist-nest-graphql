import { ConfigModule } from '@nestjs/config';
import { Module } from '@nestjs/common';
import { SeedService } from './seed.service';
import { SeedResolver } from './seed.resolver';
import { UsersModule } from '../users/users.module';
import { ItemsModule } from '../items/items.module';
import { SeedController } from './seed.controller';

@Module({
  imports: [UsersModule, ItemsModule, ConfigModule],
  exports: [],
  providers: [SeedResolver, SeedService],
  controllers: [SeedController],
})
export class SeedModule {}
