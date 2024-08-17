import { Injectable } from '@nestjs/common';
import { connect, Channel } from 'amqplib';
import { ConfigService } from '@nestjs/config';
import { IRabbitmqConfig } from '../../configs/rabbitmq.config';

@Injectable()
export class RabbitMQProducerService {
  private channel: Channel;

  constructor(private readonly configService: ConfigService) {
    this.connect();
  }

  private async connect() {
    const rabbitmqConfig = this.configService.get<IRabbitmqConfig>('rabbitmq');

    const connection = await connect(
      `amqp://${rabbitmqConfig.username}:${rabbitmqConfig.password}@${rabbitmqConfig.host}:${rabbitmqConfig.port}`,
    );
    this.channel = await connection.createChannel();
    await this.channel.assertQueue('queue3', { durable: true });
  }

  async sendMessageWithAFile(queueName: string, message: any) {
    await this.channel.assertQueue(queueName, { durable: true });
    this.channel.sendToQueue(queueName, Buffer.from(JSON.stringify(message)));
    console.log(`Sent message: to ${queueName}`);
  }

  async sendMessageToQueue3(message: any) {
    this.channel.sendToQueue('queue3', Buffer.from(JSON.stringify(message)));
    console.log(`Sent message to queue3: ${JSON.stringify(message)}`);
  }
}
