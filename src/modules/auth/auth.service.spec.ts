import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { User } from '../users/user.entity';
import { Repository } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import { HttpException } from '@nestjs/common';

describe('AuthService', () => {
  let service: AuthService;
  let userRepository: Partial<Record<keyof Repository<User>, jest.Mock>>;
  // let jwtService: JwtService;

  beforeEach(async () => {
    userRepository = {
      findOne: jest.fn(),
      save: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: getRepositoryToken(User),
          useValue: userRepository,
        },
        {
          provide: JwtService,
          useValue: {
            sign: jest.fn().mockReturnValue('token'),
            verify: jest.fn().mockReturnValue({ email: 'test@example.com' }),
          },
        },
      ],
    }).compile();

    service = module.get<AuthService, AuthService>(AuthService);
    // jwtService = module.get<JwtService, JwtService>(JwtService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('register', () => {
    it('should successfully register a user', async () => {
      const user = { email: 'test@example.com', password: 'Password123!' };

      userRepository.findOne.mockResolvedValue(null); // No user exists
      userRepository.save.mockResolvedValue(user as any); // Save the user

      const result = await service.register(user.email, user.password);
      expect(result).toEqual(user);
    });

    it('should throw an error if user already exists', async () => {
      const user = { email: 'test@example.com', password: 'Password123!' };

      // Directly set the mock implementation
      userRepository.findOne.mockResolvedValue(user as any); // User already exists

      await expect(service.register(user.email, user.password)).rejects.toThrow(
        HttpException,
      );
    });
  });
});
