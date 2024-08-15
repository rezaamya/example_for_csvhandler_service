import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '../users/user.entity';
import { JwtModule } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { IAppConfig } from '../../configs/app.config';

@Module({
  imports: [
    JwtModule.registerAsync({
      imports: [],
      global: true,
      useFactory: async (configService: ConfigService) => {
        const appConfig = configService.get<IAppConfig>('app');
        return {
          secret: appConfig.jwtSecret,
          signOptions: { expiresIn: `${appConfig.jwtExpiresInSeconds}s` },
        };
      },
      inject: [ConfigService],
    }),
    TypeOrmModule.forFeature([User]),
  ],
  providers: [AuthService],
  controllers: [AuthController],
})
export class AuthModule {}
