import { Test, TestingModule } from '@nestjs/testing';
import { SalesService } from './sale.service';
import { CartService } from '../cart/cart.service';
import { Repository } from 'typeorm';
import { Sale } from './sale.entity';
import { SaleItem } from './sale-item.entity';
import { CartItem } from '../cart/cart-item.entity';
import { User } from '../users/user.entity';
import { getRepositoryToken } from '@nestjs/typeorm';
import { BadRequestException, NotFoundException } from '@nestjs/common';

describe('SalesService', () => {
    let salesService: SalesService;
    let cartService: Partial<CartService>;
    let saleRepo: Partial<Repository<Sale>>;
    let saleItemRepo: Partial<Repository<SaleItem>>;
    let itemRepo: Partial<Repository<CartItem>>;
    let userRepo: Partial<Repository<User>>;

    beforeEach(async () => {
        cartService = {
            getCartItems: jest.fn(),
        };

        saleRepo = {
            create: jest.fn(),
            save: jest.fn(),
            find: jest.fn(),
        };

        saleItemRepo = {
            create: jest.fn(),
            save: jest.fn(),
        };

        itemRepo = {
            delete: jest.fn(),
        };

        userRepo = {
            findOne: jest.fn(),
        };

        const module: TestingModule = await Test.createTestingModule({
            providers: [
                SalesService,
                { provide: CartService, useValue: cartService },
                { provide: getRepositoryToken(Sale), useValue: saleRepo },
                { provide: getRepositoryToken(SaleItem), useValue: saleItemRepo },
                { provide: getRepositoryToken(CartItem), useValue: itemRepo },
                { provide: getRepositoryToken(User), useValue: userRepo },
            ],
        }).compile();

        salesService = module.get<SalesService>(SalesService);
    });


    describe('finalizeSale', () => {

        it('deve finalizar a venda com sucesso', async () => {
            const user = { id: 1 };
            const cartItems = [
                { id: 1, quantity: 2, product: { price: '10', id: 'prod1' }, selected: true },
                { id: 2, quantity: 1, product: { price: '5', id: 'prod2' }, selected: false },
            ];

            (cartService.getCartItems as jest.Mock).mockResolvedValue({ items: cartItems, total: 20 });
            (userRepo.findOne as jest.Mock).mockResolvedValue(user);
            (saleRepo.create as jest.Mock).mockReturnValue({ user, total: 20 });
            (saleRepo.save as jest.Mock).mockResolvedValue({ id: 1, user, total: 20 });
            (saleItemRepo.create as jest.Mock).mockImplementation((data) => data);
            (saleItemRepo.save as jest.Mock).mockResolvedValue([]);
            (itemRepo.delete as jest.Mock).mockResolvedValue(null);

            const result = await salesService.finalizeSale(1);

            expect(saleRepo.create).toHaveBeenCalledWith({ user, total: 20 });
            expect(saleRepo.save).toHaveBeenCalled();
            expect(saleItemRepo.save).toHaveBeenCalled();
            expect(itemRepo.delete).toHaveBeenCalledTimes(1);
            expect(result).toHaveProperty('items');
        });

        it('deve lançar exceção se não houver itens selecionados', async () => {
            (cartService.getCartItems as jest.Mock).mockResolvedValue({ items: [{ selected: false }], total: 0 });
            await expect(salesService.finalizeSale(1)).rejects.toThrow(BadRequestException);
            await expect(salesService.finalizeSale(1)).rejects.toThrow('Nenhum item selecionado para finalizar a venda.');
        });

        it('deve lançar exceção se usuário não for encontrado', async () => {
            (cartService.getCartItems as jest.Mock).mockResolvedValue({
                items: [{ selected: true, quantity: 1, product: { price: '10' } }],
                total: 10
            });
            (userRepo.findOne as jest.Mock).mockResolvedValue(null);

            await expect(salesService.finalizeSale(1)).rejects.toThrow(BadRequestException);
            await expect(salesService.finalizeSale(1)).rejects.toThrow('Usuário não encontrado.');
        });

        it('deve remover todos os itens selecionados do carrinho, mesmo se houver múltiplos', async () => {
            const user = { id: 1 };
            const cartItems = [
                { id: 1, quantity: 1, product: { price: '10', id: 'prod1' }, selected: true },
                { id: 2, quantity: 1, product: { price: '5', id: 'prod2' }, selected: true },
            ];

            (cartService.getCartItems as jest.Mock).mockResolvedValue({ items: cartItems, total: 15 });
            (userRepo.findOne as jest.Mock).mockResolvedValue(user);
            (saleRepo.create as jest.Mock).mockReturnValue({ user, total: 15 });
            (saleRepo.save as jest.Mock).mockResolvedValue({ id: 1, user, total: 15 });
            (saleItemRepo.create as jest.Mock).mockImplementation((data) => data);
            (saleItemRepo.save as jest.Mock).mockResolvedValue([]);
            (itemRepo.delete as jest.Mock).mockResolvedValue(null);

            const result = await salesService.finalizeSale(1);

            expect(itemRepo.delete).toHaveBeenCalledTimes(cartItems.length);
            expect(result).toHaveProperty('items');
            expect(result.total).toBe(15);
        });
    });

    describe('getSalesByUser', () => {
        it('deve retornar lista de vendas do usuário ordenadas pela data', async () => {
            const salesList = [{ id: 1 }, { id: 2 }];
            (saleRepo.find as jest.Mock).mockResolvedValue(salesList);

            const result = await salesService.getSalesByUser(1);

            expect(result).toEqual(salesList);
            expect(saleRepo.find).toHaveBeenCalledWith({
                where: { user: { id: 1 } },
                relations: ['items'],
                order: { createdAt: 'DESC' },
            });
        });

        it('deve retornar lista vazia se usuário não tiver vendas', async () => {
            (saleRepo.find as jest.Mock).mockResolvedValue([]);

            const result = await salesService.getSalesByUser(99);

            expect(result).toEqual([]);
        });
    });
});
