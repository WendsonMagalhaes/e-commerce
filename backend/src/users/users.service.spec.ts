import { Test, TestingModule } from '@nestjs/testing';
import { UsersService } from './users.service';
import { Repository } from 'typeorm';
import { User } from './user.entity';
import { getRepositoryToken } from '@nestjs/typeorm';

describe('UsersService', () => {
    let usersService: UsersService;
    let userRepo: Partial<Repository<User>>;

    beforeEach(async () => {
        userRepo = {
            findOne: jest.fn(),
            save: jest.fn(),
            create: jest.fn(),
            find: jest.fn(),
        };

        const module: TestingModule = await Test.createTestingModule({
            providers: [
                UsersService,
                { provide: getRepositoryToken(User), useValue: userRepo },
            ],
        }).compile();

        usersService = module.get<UsersService>(UsersService);
    });

    describe('findById', () => {
        it('deve retornar usuário quando encontrado (positivo)', async () => {
            const user = { id: 1, email: 'user@test.com', name: 'User Test' };
            (userRepo.findOne as jest.Mock).mockResolvedValue(user);

            const result = await usersService.findById(1);

            expect(result).toEqual(user);
            expect(userRepo.findOne).toHaveBeenCalledWith({ where: { id: 1 } });
        });

        it('deve retornar null quando usuário não encontrado (negativo)', async () => {
            (userRepo.findOne as jest.Mock).mockResolvedValue(null);

            const result = await usersService.findById(999);

            expect(result).toBeNull();
            expect(userRepo.findOne).toHaveBeenCalledWith({ where: { id: 999 } });
        });

        it('deve retornar null com id inválido (borda) - sem tratamento explícito', async () => {
            (userRepo.findOne as jest.Mock).mockResolvedValue(null);

            expect(await usersService.findById(0)).toBeNull();
            expect(await usersService.findById(-10)).toBeNull();
        });
    });


    describe('findByEmail', () => {
        it('deve retornar usuário quando encontrado (positivo)', async () => {
            const user = { id: 1, email: 'user@test.com' };
            (userRepo.findOne as jest.Mock).mockResolvedValue(user);

            const result = await usersService.findByEmail('user@test.com');

            expect(result).toEqual(user);
            expect(userRepo.findOne).toHaveBeenCalledWith({ where: { email: 'user@test.com' } });
        });

        it('deve retornar null quando usuário não encontrado (negativo)', async () => {
            (userRepo.findOne as jest.Mock).mockResolvedValue(null);

            const result = await usersService.findByEmail('notfound@test.com');

            expect(result).toBeNull();
            expect(userRepo.findOne).toHaveBeenCalledWith({ where: { email: 'notfound@test.com' } });
        });

        it('deve retornar null com email vazio ou inválido (borda) - sem tratamento explícito', async () => {
            (userRepo.findOne as jest.Mock).mockResolvedValue(null);

            expect(await usersService.findByEmail('')).toBeNull();
            expect(await usersService.findByEmail('invalid-email')).toBeNull();
        });
    });


    describe('create', () => {
        it('deve criar e salvar usuário com sucesso (positivo)', async () => {
            const createDto = { email: 'new@test.com', name: 'New User', password: 'hashpass' };
            const userEntity = { ...createDto, id: 1 };

            (userRepo.create as jest.Mock).mockReturnValue(userEntity);
            (userRepo.save as jest.Mock).mockResolvedValue(userEntity);

            const result = await usersService.create(createDto);

            expect(userRepo.create).toHaveBeenCalledWith(createDto);
            expect(userRepo.save).toHaveBeenCalledWith(userEntity);
            expect(result).toEqual(userEntity);
        });

        it('deve lançar erro se dados forem inválidos (negativo)', async () => {

            const createDto = { email: '', name: '', password: '' };

            (userRepo.create as jest.Mock).mockReturnValue(createDto);
            (userRepo.save as jest.Mock).mockRejectedValue(new Error('Validation failed'));

            await expect(usersService.create(createDto)).rejects.toThrow('Validation failed');
        });
    });


    describe('findAll', () => {
        it('deve retornar lista de usuários (positivo)', async () => {
            const users = [
                { id: 1, email: 'user1@test.com' },
                { id: 2, email: 'user2@test.com' },
            ];
            (userRepo.find as jest.Mock).mockResolvedValue(users);

            const result = await usersService.findAll();

            expect(result).toEqual(users);
            expect(userRepo.find).toHaveBeenCalled();
        });

        it('deve retornar lista vazia quando não houver usuários (borda)', async () => {
            (userRepo.find as jest.Mock).mockResolvedValue([]);

            const result = await usersService.findAll();

            expect(result).toEqual([]);
        });
    });
});
