import { plainToInstance } from 'class-transformer';
import { IsNumber, IsString, validateSync } from 'class-validator';

export class EnvironmentVariables {
  @IsNumber()
  APP_PORT: number = 4000;

  @IsString()
  APP_JWT_SECRET: string;

  @IsNumber()
  APP_JWT_EXPIRES_IN_SECONDS: number = 60 * 60 * 24;

  @IsString()
  POSTGRES_HOST: string = 'localhost';

  @IsNumber()
  POSTGRES_PORT: number = 5432;

  @IsString()
  POSTGRES_USER: string;

  @IsString()
  POSTGRES_PASSWORD: string;

  @IsString()
  POSTGRES_DB: string;
}

export function configValidator(config: Record<string, unknown>) {
  const validatedConfig = plainToInstance(EnvironmentVariables, config, {
    enableImplicitConversion: true,
  });
  const errors = validateSync(validatedConfig, {
    skipMissingProperties: false,
  });

  if (errors.length > 0) {
    throw new Error(errors.toString());
  }

  return validatedConfig;
}
