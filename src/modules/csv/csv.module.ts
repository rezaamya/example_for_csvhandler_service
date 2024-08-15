import { Module } from '@nestjs/common';
import { CsvService } from './csv.service';
import { CsvController } from './csv.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Record } from './record.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Record])],
  providers: [CsvService],
  controllers: [CsvController],
})
export class CsvModule {}
