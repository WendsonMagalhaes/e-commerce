import { Test, TestingModule } from '@nestjs/testing';
import { FavoritesService } from './favorites.service';
import { UsersService } from '../users/users.service';
import { ProductsService } from '../products/products.service';
import { Repository } from 'typeorm';
import { Favorite } from './favorite.entity';
import { getRepositoryToken } from '@nestjs/typeorm';
import { NotFoundException, BadRequestException } from '@nestjs/common';

describe('FavoritesService', () => {
    let favoritesService: FavoritesService;
    let userService: Partial<UsersService>;
    let productsService: Partial<ProductsService>;
    let favoriteRepo: Partial<Repository<Favorite>>;

    beforeEach(async () => {
        userService = { findById: jest.fn() };
        productsService = { getProductUnifiedById: jest.fn() };
        favoriteRepo = {
            findOne: jest.fn(),
            create: jest.fn(),
            save: jest.fn(),
            delete: jest.fn(),
            find: jest.fn(),
        };

        const module: TestingModule = await Test.createTestingModule({
            providers: [
                FavoritesService,
                { provide: UsersService, useValue: userService },
                { provide: ProductsService, useValue: productsService },
                { provide: getRepositoryToken(Favorite), useValue: favoriteRepo },
            ],
        }).compile();

        favoritesService = module.get<FavoritesService>(FavoritesService);
    });

    describe('addFavorite', () => {
        it('deve adicionar favorito se não existir', async () => {
            (userService.findById as jest.Mock).mockResolvedValue({ id: 1 });
            (productsService.getProductUnifiedById as jest.Mock).mockResolvedValue({ id: 'prod1' });
            (favoriteRepo.findOne as jest.Mock).mockResolvedValue(null);
            (favoriteRepo.create as jest.Mock).mockReturnValue({ user: { id: 1 }, productId: 'prod1', provider: 'prov1' });
            (favoriteRepo.save as jest.Mock).mockResolvedValue({ id: 1, user: { id: 1 }, productId: 'prod1', provider: 'prov1' });

            const result = await favoritesService.addFavorite(1, 'prod1', 'prov1');

            expect(result).toHaveProperty('id', 1);
            expect(favoriteRepo.save).toHaveBeenCalled();
        });

        it('não deve adicionar se favorito já existir', async () => {
            (userService.findById as jest.Mock).mockResolvedValue({ id: 1 });
            (productsService.getProductUnifiedById as jest.Mock).mockResolvedValue({ id: 'prod1' });
            (favoriteRepo.findOne as jest.Mock).mockResolvedValue({ id: 1 });

            const result = await favoritesService.addFavorite(1, 'prod1', 'prov1');

            expect(result).toHaveProperty('id', 1);
            expect(favoriteRepo.save).not.toHaveBeenCalled();
        });

        it('deve lançar erro se usuário não for encontrado', async () => {
            (userService.findById as jest.Mock).mockResolvedValue(null);
            await expect(favoritesService.addFavorite(1, 'prod1', 'prov1')).rejects.toThrow(NotFoundException);
        });

        it('deve lançar erro se produto não for encontrado', async () => {
            (userService.findById as jest.Mock).mockResolvedValue({ id: 1 });
            (productsService.getProductUnifiedById as jest.Mock).mockResolvedValue(null);
            await expect(favoritesService.addFavorite(1, 'prod1', 'prov1')).rejects.toThrow(NotFoundException);
        });

        it('deve lançar erro se provider estiver vazio', async () => {
            await expect(favoritesService.addFavorite(1, 'prod1', '')).rejects.toThrow(BadRequestException);
            await expect(favoritesService.addFavorite(1, 'prod1', '   ')).rejects.toThrow(BadRequestException);
        });
    });

    describe('removeFavorite', () => {
        it('deve remover favorito existente', async () => {
            const mockFavorite = { id: 1, user: { id: 1 }, productId: 'prod1', provider: 'prov1' };
            (favoriteRepo.findOne as jest.Mock).mockResolvedValue(mockFavorite);
            (favoriteRepo.delete as jest.Mock).mockResolvedValue({ affected: 1 });

            await favoritesService.removeFavorite(1, 'prod1', 'prov1');

            expect(favoriteRepo.delete).toHaveBeenCalledWith({
                user: { id: 1 },
                productId: 'prod1',
                provider: 'prov1',
            });
        });


        it('deve lançar exceção se favorito não existir', async () => {
            (favoriteRepo.findOne as jest.Mock).mockResolvedValue(null);

            await expect(favoritesService.removeFavorite(1, 'prod1', 'prov1')).rejects.toThrow(NotFoundException);
        });
    });

    describe('getFavorites', () => {
        it('deve retornar lista de favoritos', async () => {
            const favorites = [
                { id: 1, productId: 'prod1', provider: 'prov1' },
                { id: 2, productId: 'prod2', provider: 'prov2' },
            ];
            (favoriteRepo.find as jest.Mock).mockResolvedValue(favorites);

            const result = await favoritesService.getFavorites(1);

            expect(result).toEqual(favorites);
        });

        it('deve retornar lista vazia se não houver favoritos', async () => {
            (favoriteRepo.find as jest.Mock).mockResolvedValue([]);

            const result = await favoritesService.getFavorites(1);

            expect(result).toEqual([]);
        });
    });

    describe('isFavorite', () => {
        it('deve retornar favorito se existir', async () => {
            (favoriteRepo.findOne as jest.Mock).mockResolvedValue({ id: 1 });

            const result = await favoritesService.isFavorite(1, 'prod1', 'prov1');

            expect(result).toHaveProperty('id', 1);
        });

        it('deve retornar null se favorito não existir', async () => {
            (favoriteRepo.findOne as jest.Mock).mockResolvedValue(null);

            const result = await favoritesService.isFavorite(1, 'prod1', 'prov1');

            expect(result).toBeNull();
        });
    });
});
