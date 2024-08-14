import * as process from 'process';

export interface IAppConfig {
  port: number;
}

const appConfig = () => ({
  app: {
    port: parseInt(process.env.APP_PORT, 10),
  },
});

export default appConfig;
