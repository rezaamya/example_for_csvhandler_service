import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../users/user.entity';
import * as bcryptjs from 'bcryptjs';
import { JwtService } from '@nestjs/jwt';
import {
  errorEmailIsAlreadyInUse,
  errorInvalidEmailOrPassword,
  errorInvalidToken,
} from './auth.msg';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly jwtService: JwtService,
  ) {}

  async register(email: string, password: string) {
    const userExists = await this.userRepository.findOne({ where: { email } });
    if (userExists) {
      throw new HttpException(errorEmailIsAlreadyInUse, HttpStatus.CONFLICT);
    }

    const user = new User();
    user.email = email;
    user.password = await bcryptjs.hash(password, 10);

    return this.userRepository.save(user);
  }

  async login(email: string, password: string) {
    const user = await this.userRepository.findOne({ where: { email } });

    if (!user) {
      throw new HttpException(
        errorInvalidEmailOrPassword,
        HttpStatus.UNAUTHORIZED,
      );
    }

    const isValid = await bcryptjs.compare(password, user.password);

    if (!isValid) {
      throw new HttpException(
        errorInvalidEmailOrPassword,
        HttpStatus.UNAUTHORIZED,
      );
    }

    return this.sign({ id: user.id });
  }

  async verifyToken(token: string) {
    try {
      return this.jwtService.verify(token);
    } catch (error) {
      throw new HttpException(errorInvalidToken, HttpStatus.UNAUTHORIZED);
    }
  }

  sign(payload) {
    return {
      token: this.jwtService.sign(payload),
    };
  }
}
