import { Controller, Post, Body } from '@nestjs/common';
import { AuthService } from './auth.service';
import {
  LoginRequestBodyDto,
  LoginResponseDto,
  RegisterRequestBodyDto,
  RegisterResponseDto,
} from './auth.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly usersService: AuthService) {}

  @Post('register')
  async register(
    @Body() body: RegisterRequestBodyDto,
  ): Promise<RegisterResponseDto> {
    await this.usersService.register(body.email, body.password);
    return { message: 'User created successfully' };
  }

  @Post('login')
  async login(@Body() body: LoginRequestBodyDto): Promise<LoginResponseDto> {
    return await this.usersService.login(body.email, body.password);
  }
}
