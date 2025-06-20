import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Favorite } from './favorite.entity';
import { UsersService } from '../users/users.service';
import { ProductsService } from '../products/products.service';

@Injectable()
export class FavoritesService {
    constructor(
        @InjectRepository(Favorite) private favoriteRepo: Repository<Favorite>,
        private userService: UsersService,
        private productsService: ProductsService,
    ) { }

    async addFavorite(userId: number, productId: string, provider: string) {
        if (!provider || provider.trim() === '') {
            throw new BadRequestException('Fornecedor inválido');
        }
        const user = await this.userService.findById(userId);
        if (!user) throw new NotFoundException('Usuário não encontrado');

        const product = await this.productsService.getProductUnifiedById(provider, productId);
        if (!product) throw new NotFoundException('Produto não encontrado');

        const exists = await this.favoriteRepo.findOne({
            where: { user: { id: userId }, productId, provider },
        });

        if (exists) return exists;

        const favorite = this.favoriteRepo.create({
            user,
            productId,
            provider,
            product,
        });

        return this.favoriteRepo.save(favorite);
    }


    async removeFavorite(userId: number, productId: string, provider: string) {
        const favorite = await this.favoriteRepo.findOne({
            where: { user: { id: userId }, productId, provider },
        });

        if (!favorite) {
            throw new NotFoundException('Favorito não encontrado');
        }
        return this.favoriteRepo.delete({ user: { id: userId }, productId, provider });
    }

    async isFavorite(userId: number, productId: string, provider: string) {
        return this.favoriteRepo.findOne({ where: { user: { id: userId }, productId, provider } });
    }

    async getFavorites(userId: number) {
        return this.favoriteRepo.find({ where: { user: { id: userId } } });
    }


}
