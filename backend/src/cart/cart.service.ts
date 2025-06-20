import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Cart } from './cart.entity';
import { CartItem } from './cart-item.entity';
import { ProductsService } from '../products/products.service';
import { UsersService } from '../users/users.service';
import { Product } from '../products/product.entity';


@Injectable()
export class CartService {
    constructor(
        @InjectRepository(Cart) private cartRepo: Repository<Cart>,
        @InjectRepository(CartItem) private itemRepo: Repository<CartItem>,
        @InjectRepository(Product) private productRepo: Repository<Product>,
        private userService: UsersService,
        private readonly productsService: ProductsService,

    ) { }

    async getOrCreateCart(userId: number): Promise<Cart> {
        let cart = await this.cartRepo.findOne({
            where: { user: { id: userId } },
            relations: ['items']
        });

        if (!cart) {
            const user = await this.userService.findById(userId);

            if (!user) {
                throw new NotFoundException('Usuário não encontrado');
            }
            const newCart = this.cartRepo.create({ user });
            cart = await this.cartRepo.save(newCart);
        }

        return cart;
    }

    async addItem(userId: number, productId: string, productProvider: string, quantity: number = 1) {
        if (!productProvider || productProvider.trim() === '') {
            throw new NotFoundException('Fornecedor inválido');
        }

        if (quantity <= 0) {
            throw new Error('Quantidade inválida');
        }

        const cart = await this.getOrCreateCart(userId);

        const productUnified = await this.productsService.getProductUnifiedById(productProvider, productId);
        if (!productUnified) throw new NotFoundException('Produto não encontrado');

        const items = await this.itemRepo.find({
            where: { cart: { id: cart.id } },
        });

        let item: CartItem | null = items.find(i => i.product.id === productUnified.id) ?? null;

        if (item) {
            item.quantity += quantity;
        } else {
            item = this.itemRepo.create({ cart, product: productUnified, quantity });
        }
        item = await this.itemRepo.save(item);
        return item;

    }


    async getCartItems(userId: number) {
        const cart = await this.getOrCreateCart(userId);
        const items = await this.itemRepo.find({ where: { cart: { id: cart.id } } });

        const itemsWithSubtotal = items.map(item => ({
            ...item,
            subtotal: item.quantity * Number(item.product.price),
        }));

        const total = itemsWithSubtotal
            .filter(i => i.selected)
            .reduce((acc, curr) => acc + curr.subtotal, 0);

        return { items: itemsWithSubtotal, total };
    }

    async updateItemQuantity(itemId: number, quantity: number) {
        const item = await this.itemRepo.findOneBy({ id: itemId });
        if (!item) throw new NotFoundException('Item não encontrado');
        item.quantity = quantity;
        return this.itemRepo.save(item);
    }

    async toggleItemSelection(itemId: number, selected: boolean) {
        const item = await this.itemRepo.findOneBy({ id: itemId });
        if (!item) throw new NotFoundException('Item não encontrado');
        item.selected = selected;
        return this.itemRepo.save(item);
    }

    async removeItem(itemId: number) {
        const item = await this.itemRepo.findOneBy({ id: itemId });
        if (!item) throw new NotFoundException('Item não encontrado');
        return this.itemRepo.delete(itemId);

    }
}
