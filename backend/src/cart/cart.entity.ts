import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToMany } from 'typeorm';
import { User } from '../users/user.entity';
import { CartItem } from './cart-item.entity';

@Entity()
export class Cart {
    @PrimaryGeneratedColumn()
    id: number;

    @ManyToOne(() => User, user => user.id, { eager: true })
    user: User;

    @OneToMany(() => CartItem, item => item.cart, { cascade: true })
    items: CartItem[];

    @Column({ default: () => 'CURRENT_TIMESTAMP' })
    createdAt: Date;
}
