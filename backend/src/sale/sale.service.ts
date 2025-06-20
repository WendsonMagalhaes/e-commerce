import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Sale } from './sale.entity';
import { SaleItem } from './sale-item.entity';
import { CartItem } from '../cart/cart-item.entity';
import { CartService } from '../cart/cart.service';
import { UnifiedProduct } from '../products/interfaces/unified-product.interface';
import { User } from '../users/user.entity';

@Injectable()
export class SalesService {
    constructor(
        @InjectRepository(Sale) private saleRepo: Repository<Sale>,
        @InjectRepository(SaleItem) private saleItemRepo: Repository<SaleItem>,
        private readonly cartService: CartService,
        @InjectRepository(CartItem) private itemRepo: Repository<CartItem>,
        @InjectRepository(User) private userRepo: Repository<User>,
    ) { }

    async finalizeSale(userId: number) {
        const { items, total } = await this.cartService.getCartItems(userId);

        const selectedItems = items.filter(i => i.selected);
        if (selectedItems.length === 0) {
            throw new BadRequestException('Nenhum item selecionado para finalizar a venda.');
        }

        const user = await this.userRepo.findOne({ where: { id: userId } });
        if (!user) {
            throw new BadRequestException('Usuário não encontrado.');
        }

        const sale = this.saleRepo.create({
            user,
            total,
        });

        await this.saleRepo.save(sale);

        const saleItems = selectedItems.map(item => {
            const product = item.product as UnifiedProduct;

            return this.saleItemRepo.create({
                product,
                quantity: item.quantity,
                price: parseFloat(product.price as any),
                sale,
            });
        });

        await this.saleItemRepo.save(saleItems);

        for (const item of selectedItems) {
            await this.itemRepo.delete(item.id);
        }

        sale.items = saleItems;

        return sale;
    }

    async getSalesByUser(userId: number) {
        return this.saleRepo.find({
            where: { user: { id: userId } },
            relations: ['items'],
            order: { createdAt: 'DESC' },
        });
    }
}
