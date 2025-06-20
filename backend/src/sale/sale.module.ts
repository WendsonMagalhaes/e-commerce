import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Sale } from './sale.entity';
import { SaleItem } from './sale-item.entity';
import { SalesService } from './sale.service';
import { SalesController } from './sale.controller';
import { CartModule } from '../cart/cart.module';
import { CartItem } from '../cart/cart-item.entity';
import { User } from '../users/user.entity';

@Module({
    imports: [TypeOrmModule.forFeature([Sale, SaleItem, CartItem, User]), CartModule],
    providers: [SalesService],
    controllers: [SalesController],
    exports: [SalesService]
})
export class SalesModule { }
