import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import postgresConfig from './configs/postgres.config';
import appConfig from './configs/app.config';
import { configValidator } from './configs/config.validation';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      cache: true,
      load: [appConfig, postgresConfig],
      validate: configValidator,
    }),
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
