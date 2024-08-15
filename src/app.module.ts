import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import postgresConfig from './configs/postgres.config';
import appConfig from './configs/app.config';
import { configValidator } from './configs/config.validation';
import { TypeOrmModule } from '@nestjs/typeorm';
import { typeOrmDataSourceOptions } from './configs/typeorm.config';
import { AuthModule } from './modules/auth/auth.module';
import { JwtModule } from '@nestjs/jwt';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      cache: true,
      load: [appConfig, postgresConfig],
      validate: configValidator,
    }),
    TypeOrmModule.forRoot(typeOrmDataSourceOptions),
    AuthModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
