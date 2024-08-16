import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RabbitMQService } from './rabbitmq.service';
import { Record } from '../csv/record.entity';
import { User } from '../users/user.entity';
import { UtilsModule } from '../utils/utils.module';

@Module({
  imports: [TypeOrmModule.forFeature([Record, User]), UtilsModule],
  providers: [RabbitMQService],
})
export class RabbitMQModule {}
