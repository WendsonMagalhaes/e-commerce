import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';
import { Sale } from './sale.entity';
import { UnifiedProduct } from '../products/interfaces/unified-product.interface';

@Entity()
export class SaleItem {
    @PrimaryGeneratedColumn()
    id: number;

    @ManyToOne(() => Sale, sale => sale.items, { onDelete: 'CASCADE' })
    sale: Sale;

    @Column('simple-json')
    product: UnifiedProduct;

    @Column({ type: 'integer', default: 1 })
    quantity: number;

    @Column('decimal', { precision: 10, scale: 2 })
    price: number;
}

