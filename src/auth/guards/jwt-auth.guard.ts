import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { userInfo } from 'os';

@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(private readonly jwtService: JwtService) {}

  async canActivate(context: ExecutionContext) {
    const request = context.switchToHttp().getRequest();
    const authorization = request.headers['authorization'];
    const token = authorization && authorization.split(' ')[1];
    
    if (!token) {
      throw new UnauthorizedException();
    }

    try {
      const tokenPayload = await this.jwtService.verifyAsync(token);
      request.user = { userId : tokenPayload.sub, email: tokenPayload.email, role: tokenPayload.role };
      return true;
    } catch (error) {
      throw new UnauthorizedException();
    }
  }
}
