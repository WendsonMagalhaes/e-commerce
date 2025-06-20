import { Test, TestingModule } from '@nestjs/testing';
import { CartService } from './cart.service';
import { UsersService } from '../users/users.service';
import { ProductsService } from '../products/products.service';
import { Repository } from 'typeorm';
import { Cart } from './cart.entity';
import { CartItem } from './cart-item.entity';
import { Product } from '../products/product.entity';
import { getRepositoryToken } from '@nestjs/typeorm';
import { NotFoundException } from '@nestjs/common';

describe('CartService', () => {
    let cartService: CartService;
    let userService: Partial<UsersService>;
    let productsService: Partial<ProductsService>;
    let cartRepo: Partial<Repository<Cart>>;
    let itemRepo: Partial<Repository<CartItem>>;
    let productRepo: Partial<Repository<Product>>;

    beforeEach(async () => {
        userService = { findById: jest.fn() };
        productsService = { getProductUnifiedById: jest.fn() };
        cartRepo = { findOne: jest.fn(), create: jest.fn(), save: jest.fn() };
        itemRepo = {
            find: jest.fn(),
            create: jest.fn(),
            save: jest.fn(),
            findOneBy: jest.fn(),
            delete: jest.fn(),
        };
        productRepo = {};

        const module: TestingModule = await Test.createTestingModule({
            providers: [
                CartService,
                { provide: UsersService, useValue: userService },
                { provide: ProductsService, useValue: productsService },
                { provide: getRepositoryToken(Cart), useValue: cartRepo },
                { provide: getRepositoryToken(CartItem), useValue: itemRepo },
                { provide: getRepositoryToken(Product), useValue: productRepo },
            ],
        }).compile();

        cartService = module.get<CartService>(CartService);
    });


    describe('getOrCreateCart', () => {
        it('deve retornar o carrinho existente', async () => {
            const mockCart = { id: 1, items: [] };
            (cartRepo.findOne as jest.Mock).mockResolvedValue(mockCart);

            const cart = await cartService.getOrCreateCart(1);
            expect(cart).toEqual(mockCart);
        });

        it('deve criar um novo carrinho se não existir', async () => {
            (cartRepo.findOne as jest.Mock).mockResolvedValue(null);
            (userService.findById as jest.Mock).mockResolvedValue({ id: 1 });
            (cartRepo.create as jest.Mock).mockReturnValue({ user: { id: 1 } });
            (cartRepo.save as jest.Mock).mockResolvedValue({ id: 123, user: { id: 1 } });

            const cart = await cartService.getOrCreateCart(1);

            expect(cartRepo.create).toHaveBeenCalled();
            expect(cart.id).toBe(123);
        });

        it('deve lançar exceção se usuário não for encontrado', async () => {
            (cartRepo.findOne as jest.Mock).mockResolvedValue(null);
            (userService.findById as jest.Mock).mockResolvedValue(null);

            await expect(cartService.getOrCreateCart(1)).rejects.toThrow(NotFoundException);
        });
    });


    describe('addItem', () => {
        it('deve adicionar novo item ao carrinho', async () => {
            const cart = { id: 1 };
            const product = { id: 'prod-1', price: '10.00' };

            (cartRepo.findOne as jest.Mock).mockResolvedValue(cart);
            (productsService.getProductUnifiedById as jest.Mock).mockResolvedValue(product);
            (itemRepo.find as jest.Mock).mockResolvedValue([]);
            (itemRepo.create as jest.Mock).mockReturnValue({ cart, product, quantity: 2 });
            (itemRepo.save as jest.Mock).mockImplementation(async (item) => ({ ...item, id: 99 }));

            const item = await cartService.addItem(1, 'prod-1', 'prov1', 2);

            expect(item.id).toBe(99);
            expect(item.quantity).toBe(2);
        });

        it('deve incrementar quantidade de item existente', async () => {
            const cart = { id: 1 };
            const existingItem = { id: 5, quantity: 2, product: { id: 'prod-1' } };
            (cartRepo.findOne as jest.Mock).mockResolvedValue(cart);
            (productsService.getProductUnifiedById as jest.Mock).mockResolvedValue({ id: 'prod-1' });
            (itemRepo.find as jest.Mock).mockResolvedValue([existingItem]);
            (itemRepo.save as jest.Mock).mockImplementation(item => Promise.resolve(item));

            const item = await cartService.addItem(1, 'prod-1', 'prov1', 3);

            expect(item.quantity).toBe(5);
        });

        it('deve lançar exceção se produto não for encontrado', async () => {
            (cartRepo.findOne as jest.Mock).mockResolvedValue({ id: 1 });
            (productsService.getProductUnifiedById as jest.Mock).mockResolvedValue(null);

            await expect(cartService.addItem(1, 'invalid', 'prov1', 1)).rejects.toThrow(NotFoundException);
        });

        it('deve lançar erro se quantidade for zero', async () => {
            (userService.findById as jest.Mock).mockResolvedValue({ id: 1 });
            (cartRepo.findOne as jest.Mock).mockResolvedValue({ id: 1 });
            (productsService.getProductUnifiedById as jest.Mock).mockResolvedValue({ id: 'prod-1', price: '10.00' });
            (itemRepo.find as jest.Mock).mockResolvedValue([]);

            await expect(cartService.addItem(1, 'prod-1', 'prov1', 0)).rejects.toThrow('Quantidade inválida');
        });

        it('deve lançar erro se quantidade for negativa', async () => {
            (userService.findById as jest.Mock).mockResolvedValue({ id: 1 });
            (cartRepo.findOne as jest.Mock).mockResolvedValue({ id: 1 });
            (productsService.getProductUnifiedById as jest.Mock).mockResolvedValue({ id: 'prod-1', price: '10.00' });
            (itemRepo.find as jest.Mock).mockResolvedValue([]);

            await expect(cartService.addItem(1, 'prod-1', 'prov1', -5)).rejects.toThrow('Quantidade inválida');
        });

        it('deve lançar erro se provider estiver em branco', async () => {
            (userService.findById as jest.Mock).mockResolvedValue({ id: 1 });
            (cartRepo.findOne as jest.Mock).mockResolvedValue({ id: 1 });
            (productsService.getProductUnifiedById as jest.Mock).mockResolvedValue({ id: 'prod-1', price: '10.00' });
            (itemRepo.find as jest.Mock).mockResolvedValue([]);

            await expect(cartService.addItem(1, 'prod-1', '', 1)).rejects.toThrow('Fornecedor inválido');
        });
    });

    describe('getCartItems', () => {

        it('deve retornar lista de itens e total', async () => {
            const cart = { id: 1 };
            const items = [
                { id: 1, quantity: 2, product: { price: '10' }, selected: true },
                { id: 2, quantity: 1, product: { price: '5' }, selected: false },
            ];
            const expected = [
                { ...items[0], subtotal: 20 },
                { ...items[1], subtotal: 5 },
            ];

            (cartRepo.findOne as jest.Mock).mockResolvedValue(cart);
            (itemRepo.find as jest.Mock).mockResolvedValue(items);

            const result = await cartService.getCartItems(1);
            expect(result.items).toEqual(expected);
            expect(result.total).toBe(20);
        });

        it('deve retornar total zero se não houver itens', async () => {
            (cartRepo.findOne as jest.Mock).mockResolvedValue({ id: 1 });
            (itemRepo.find as jest.Mock).mockResolvedValue([]);

            const result = await cartService.getCartItems(1);
            expect(result.total).toBe(0);
            expect(result.items.length).toBe(0);
        });

        it('deve ignorar itens não selecionados no total', async () => {
            (cartRepo.findOne as jest.Mock).mockResolvedValue({ id: 1 });
            const items = [
                { quantity: 2, product: { price: '10.00' }, selected: false },
                { quantity: 1, product: { price: '5.00' }, selected: false },
            ];
            (itemRepo.find as jest.Mock).mockResolvedValue(items);

            const result = await cartService.getCartItems(1);
            expect(result.total).toBe(0);
        });

        it('deve calcular corretamente com valores decimais', async () => {
            (cartRepo.findOne as jest.Mock).mockResolvedValue({ id: 1 });
            const items = [
                { quantity: 1, product: { price: '9.99' }, selected: true },
                { quantity: 2, product: { price: '4.50' }, selected: true },
            ];
            (itemRepo.find as jest.Mock).mockResolvedValue(items);

            const result = await cartService.getCartItems(1);
            expect(result.total).toBeCloseTo(18.99, 2);
        });
    });


    describe('removeItem', () => {
        it('deve remover item do carrinho', async () => {
            const mockItem = { id: 1, cart: { id: 1 } };
            (itemRepo.findOneBy as jest.Mock).mockResolvedValue(mockItem);

            await cartService.removeItem(1);

            expect(itemRepo.delete).toHaveBeenCalledWith(1);
        });

        it('deve lançar exceção se item não for encontrado', async () => {
            (itemRepo.findOneBy as jest.Mock).mockResolvedValue(null);

            await expect(cartService.removeItem(1)).rejects.toThrow(NotFoundException);
        });
    });
});
