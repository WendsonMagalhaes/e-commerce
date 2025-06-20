import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { UnauthorizedException } from '@nestjs/common';

describe('AuthService', () => {
    let authService: AuthService;
    let usersService: Partial<UsersService>;
    let jwtService: Partial<JwtService>;

    beforeEach(async () => {
        usersService = {
            findByEmail: jest.fn(),
            create: jest.fn(),
        };

        jwtService = {
            sign: jest.fn().mockReturnValue('mocked_jwt_token'),
        };

        const module: TestingModule = await Test.createTestingModule({
            providers: [
                AuthService,
                { provide: UsersService, useValue: usersService },
                { provide: JwtService, useValue: jwtService },
            ],
        }).compile();

        authService = module.get<AuthService>(AuthService);
    });

    describe('validateUser', () => {
        it('deve retornar o usuário se as credenciais estiverem corretas', async () => {
            const user = {
                id: 1,
                email: 'test@test.com',
                password: await bcrypt.hash('1234', 10),
                name: 'User Test',
            };
            (usersService.findByEmail as jest.Mock).mockResolvedValue(user);

            const result = await authService.validateUser('test@test.com', '1234');

            expect(result).toEqual({
                id: 1,
                email: 'test@test.com',
                name: 'User Test',
            });
        });

        it('deve lançar UnauthorizedException se o usuário não for encontrado', async () => {
            (usersService.findByEmail as jest.Mock).mockResolvedValue(null);

            await expect(authService.validateUser('not@found.com', '1234'))
                .rejects.toThrow(UnauthorizedException);
        });

        it('deve lançar UnauthorizedException se a senha estiver incorreta', async () => {
            const user = {
                id: 2,
                email: 'wrong@pass.com',
                password: await bcrypt.hash('correct', 10),
                name: 'Wrong Pass',
            };
            (usersService.findByEmail as jest.Mock).mockResolvedValue(user);

            await expect(authService.validateUser('wrong@pass.com', 'wrong'))
                .rejects.toThrow(UnauthorizedException);
        });

        it('deve retornar null se a senha ou email forem vazios', async () => {
            await expect(authService.validateUser('', ''))
                .rejects.toThrow(UnauthorizedException);
        });
    });

    describe('login', () => {
        it('deve retornar um token JWT válido', async () => {
            const user = { id: 1, email: 'login@test.com', name: 'Login Test' };

            const result = await authService.login(user);

            expect(result).toEqual({ access_token: 'mocked_jwt_token' });
            expect(jwtService.sign).toHaveBeenCalledWith({
                sub: user.id,
                email: user.email,
                name: user.name,
            });
        });
    });

    describe('register', () => {
        const newUser = {
            email: 'new@test.com',
            name: 'New User',
            password: '1234',
        };

        it('deve lançar UnauthorizedException se o e-mail já existir', async () => {
            (usersService.findByEmail as jest.Mock).mockResolvedValue({ id: 1 });

            await expect(authService.register(newUser))
                .rejects.toThrow(UnauthorizedException);
        });

        it('deve registrar e retornar token se o e-mail for novo', async () => {
            (usersService.findByEmail as jest.Mock).mockResolvedValue(null);
            (usersService.create as jest.Mock).mockResolvedValue({
                id: 5,
                ...newUser,
            });

            const result = await authService.register(newUser);

            expect(result).toEqual({ access_token: 'mocked_jwt_token' });
            expect(usersService.create).toHaveBeenCalledWith(expect.objectContaining({
                email: newUser.email,
                name: newUser.name,
            }));
        });

        it('deve lançar UnauthorizedException se dados forem inválidos', async () => {
            (usersService.findByEmail as jest.Mock).mockResolvedValue(null);
            (usersService.create as jest.Mock).mockRejectedValue(new Error('Erro de criação'));

            await expect(authService.register({ ...newUser, email: '' }))
                .rejects.toThrow();
        });
    });
});
