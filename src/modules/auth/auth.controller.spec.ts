import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';

describe('AuthController', () => {
  let controller: AuthController;
  let service: AuthService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        {
          provide: AuthService,
          useValue: {
            register: jest.fn(),
            login: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<AuthController, AuthController>(AuthController);
    service = module.get<AuthService, AuthService>(AuthService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('register', () => {
    it('should return a success message', async () => {
      const body = { email: 'test@example.com', password: 'Password123!' };
      (service.register as jest.Mock).mockResolvedValue(undefined);

      const result = await controller.register(body);
      expect(result).toEqual({ message: 'User created successfully' });
    });
  });
});
