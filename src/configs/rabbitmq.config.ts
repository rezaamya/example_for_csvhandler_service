import * as process from 'process';
export interface IRabbitmqConfig {
  port: number;
  host: string;
  username: string;
  password: string;
}

const rabbitmqConfig = () => ({
  rabbitmq: {
    port: parseInt(process.env.RABBITMQ_PORT, 10),
    host: process.env.RABBITMQ_HOST,
    username: process.env.RABBITMQ_USERNAME,
    password: process.env.RABBITMQ_PASSWORD,
  },
});

export default rabbitmqConfig;
