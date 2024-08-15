import { Injectable } from '@nestjs/common';
import { CanActivate, ExecutionContext } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(private readonly jwtService: JwtService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    let token = request.headers['authorization'];

    if (!token) {
      return false;
    }

    token = token.replace('Bearer ', '');

    try {
      request.user = this.jwtService.verify(token);
      return true;
    } catch (error) {
      return false;
    }
  }
}
