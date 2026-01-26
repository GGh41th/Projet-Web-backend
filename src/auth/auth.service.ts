import { Injectable } from '@nestjs/common';
import { UsersService } from 'src/users/users.service';
import { JwtService } from '@nestjs/jwt';

type AuthInput = {email: string, password: string};
type SignInData = {userId : string, email: string};
type AuthResult = {accessToken: string, userId: string, email: string};

@Injectable()
export class AuthService {
    constructor(private usersService: UsersService, private jwtService: JwtService) {}

    async authenticate(input: AuthInput): Promise<AuthResult> {
        const user = await this.validateUser(input);
        if (!user) {
            throw new Error('Invalid credentials');
        }
        return this.signIn(user);
    }
    
    
    async validateUser(input: AuthInput): Promise<SignInData | null> {
        const user = await this.usersService.findByEmail(input.email);

        if (user && await user.validatePassword(input.password)) {
            return { userId: user.id, email: user.email };
        }
        return null;
    }

    async signIn(user: SignInData): Promise<AuthResult> {
        const payload = { sub: user.userId, email: user.email };
        const accessToken = this.jwtService.sign(payload);
        return {
            accessToken,
            userId: user.userId,
            email: user.email,
        };
    }
}