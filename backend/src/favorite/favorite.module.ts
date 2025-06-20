import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Favorite } from './favorite.entity';
import { FavoritesService } from './favorites.service';
import { FavoritesController } from './favorites.controller';
import { UsersModule } from '../users/users.module';
import { ProductsModule } from '../products/products.module';

@Module({
    imports: [TypeOrmModule.forFeature([Favorite]), UsersModule, ProductsModule],
    providers: [FavoritesService],
    controllers: [FavoritesController]
})
export class FavoritesModule { }
