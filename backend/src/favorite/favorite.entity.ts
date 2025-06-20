import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';
import { User } from '../users/user.entity';

@Entity()
export class Favorite {
    @PrimaryGeneratedColumn()
    id: number;

    @ManyToOne(() => User, user => user.id, { eager: true, onDelete: 'CASCADE' })
    user: User;

    @Column()
    productId: string;

    @Column()
    provider: string;

    @Column('simple-json')
    product: any;
}
