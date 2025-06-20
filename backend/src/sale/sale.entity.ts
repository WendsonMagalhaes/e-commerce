import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToMany, CreateDateColumn } from 'typeorm';
import { User } from '../users/user.entity';
import { SaleItem } from './sale-item.entity';

@Entity()
export class Sale {
    @PrimaryGeneratedColumn()
    id: number;

    @ManyToOne(() => User)
    user: User;

    @CreateDateColumn()
    createdAt: Date;

    @OneToMany(() => SaleItem, item => item.sale, { cascade: true })
    items: SaleItem[];

    @Column('decimal', { precision: 10, scale: 2 })
    total: number;
}
