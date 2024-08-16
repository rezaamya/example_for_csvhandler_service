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
  }

  private async connectToRabbitMQ() {
    const rabbitmqConfig = this.configService.get<IRabbitmqConfig>('rabbitmq');
    this.connection = await connect(
      `amqp://${rabbitmqConfig.username}:${rabbitmqConfig.password}@${rabbitmqConfig.host}:${rabbitmqConfig.port}`,
    );
    this.channel = await this.connection.createChannel();
    await this.channel.assertQueue('queue1');
  }

  private async listenToQueue1() {
    await this.channel.consume('queue1', async (msg) => {
      try {
        const { userId, file } = JSON.parse(msg.content.toString());
        const csvRows = await this.csvUtilitiesService.parseCSV(file);
        const records = csvRows.map((row) => {
          return { ...row, user: { id: userId } };
        });
        await this.recordRepository.save(records);
        this.channel.ack(msg);
      } catch (e) {
        console.error(e);
        //TODO
        // Should we keep the message in the queue?
        this.channel.ack(msg);
      }
    });
  }
}
