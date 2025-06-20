import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';
import { Cart } from './cart.entity';
import { UnifiedProduct } from '../products/interfaces/unified-product.interface'

@Entity()
export class CartItem {
    @PrimaryGeneratedColumn()
    id: number;

    @ManyToOne(() => Cart, cart => cart.items, { onDelete: 'CASCADE' })
    cart: Cart;

    @Column('simple-json')
    product: UnifiedProduct;

    @Column({ type: 'integer', default: 1 })
    quantity: number;

    @Column({ default: false })
    selected: boolean;
}
