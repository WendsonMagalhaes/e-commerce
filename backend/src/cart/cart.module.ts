import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Cart } from './cart.entity';
import { CartItem } from './cart-item.entity';
import { CartService } from './cart.service';
import { CartController } from './cart.controller';
import { Product } from '../products/product.entity';
import { UsersModule } from '../users/users.module';
import { ProductsModule } from '../products/products.module'

@Module({
    imports: [TypeOrmModule.forFeature([Cart, CartItem, Product]), UsersModule, ProductsModule],
    providers: [CartService],
    controllers: [CartController],
    exports: [CartService],
})
export class CartModule { }
