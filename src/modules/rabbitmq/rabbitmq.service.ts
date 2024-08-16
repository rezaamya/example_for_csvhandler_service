import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Record } from '../csv/record.entity';
import { User } from '../users/user.entity';
import { connect, Connection, Channel } from 'amqplib';
import { CsvUtilitiesService } from '../utils/csv-utilities.service';
import { ConfigService } from '@nestjs/config';
import { IRabbitmqConfig } from '../../configs/rabbitmq.config';

@Injectable()
export class RabbitMQService {
  private connection: Connection;
  private channel: Channel;

  constructor(
    private readonly configService: ConfigService,
    @InjectRepository(Record)
    private readonly recordRepository: Repository<Record>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly csvUtilitiesService: CsvUtilitiesService,
  ) {}

  async onModuleInit() {
    await this.connectToRabbitMQ();
    await this.listenToQueue1();
    await this.listenToQueue2();
    await this.listenToQueue3();
  }

  private async connectToRabbitMQ() {
    const rabbitmqConfig = this.configService.get<IRabbitmqConfig>('rabbitmq');
    this.connection = await connect(
      `amqp://${rabbitmqConfig.username}:${rabbitmqConfig.password}@${rabbitmqConfig.host}:${rabbitmqConfig.port}`,
    );
    this.channel = await this.connection.createChannel();
    await this.channel.assertQueue('queue1', { durable: true });
    await this.channel.assertQueue('queue2', { durable: true });
    await this.channel.assertQueue('queue3', { durable: true });
  }

  private async listenToQueue1() {
    await this.channel.consume('queue1', async (msg) => {
      try {
        const { userId, file } = JSON.parse(msg.content.toString());
        const csvRows = await this.csvUtilitiesService.parseCSV(file);
        const records = csvRows.map((row) => {
          return { ...row, user: { id: userId } };
        });

        // It will insert all records or none (in face with exception)
        await this.recordRepository.insert(records);
        this.channel.ack(msg);
      } catch (e) {
        console.error(e);
        if (e.detail && e.code) {
          // Database logic errors (e.g. duplicated record, foreign key constraint).
          this.channel.ack(msg);
        } else {
          this.channel.nack(msg, false, true);
        }
      }
    });
  }

  private async listenToQueue2() {
    await this.channel.consume('queue2', async (msg) => {
      try {
        const { userId, file } = JSON.parse(msg.content.toString());
        const csvRows = await this.csvUtilitiesService.parseCSV(file);
        for (const row of csvRows) {
          this.channel.sendToQueue(
            'queue3',
            Buffer.from(JSON.stringify({ ...row, user: { id: userId } })),
          );
        }
        this.channel.ack(msg);
      } catch (e) {
        console.error(e);
        //TODO
        // Should we keep the message in the queue?
        this.channel.nack(msg, false, true);
        // this.channel.ack(msg);
      }
    });
  }

  private async listenToQueue3() {
    await this.channel.consume('queue3', async (msg) => {
      try {
        const record = JSON.parse(msg.content.toString());
        // It will insert records one by one and skip those records who faced with error
        await this.recordRepository.insert(record);
        this.channel.ack(msg);
      } catch (e) {
        console.error(e);
        if (e?.code === '23505') {
          this.channel.ack(msg);
        } else {
          this.channel.nack(msg, false, true);
        }
      }
    });
  }
}
