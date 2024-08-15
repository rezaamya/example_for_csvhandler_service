import * as process from 'process';

export interface IAppConfig {
  port: number;
  jwtSecret: string;
  jwtExpiresInSeconds: number;
}

const appConfig = () => ({
  app: {
    port: parseInt(process.env.APP_PORT, 10),
    jwtSecret: process.env.APP_JWT_SECRET,
    jwtExpiresInSeconds: parseInt(process.env.APP_JWT_EXPIRES_IN_SECONDS),
  },
});

export default appConfig;
