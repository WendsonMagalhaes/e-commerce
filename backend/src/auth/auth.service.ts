import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
    constructor(
        private usersService: UsersService,
        private jwtService: JwtService,
    ) { }

    async validateUser(email: string, password: string): Promise<any> {
        const user = await this.usersService.findByEmail(email);
        if (user && await bcrypt.compare(password, user.password)) {
            const { password, ...result } = user;
            return result;
        }
        throw new UnauthorizedException('Credenciais inválidas');
    }

    async login(user: any) {
        const payload = {
            email: user.email,
            sub: user.id,
            name: user.name
        };
        return {
            access_token: this.jwtService.sign(payload),
        };
    }

    async register(data: any) {
        const existing = await this.usersService.findByEmail(data.email);
        if (existing) throw new UnauthorizedException('Email já cadastrado');

        const hashedPassword = await bcrypt.hash(data.password, 10);
        const user = await this.usersService.create({
            ...data,
            password: hashedPassword,
        });

        return this.login(user);
    }
}
