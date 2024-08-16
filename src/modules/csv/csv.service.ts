import { HttpException, HttpStatus, Inject, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Record } from './record.entity';
import { errorUnableToInsertCsv, msgNoRecordFound } from './csv.msg';
import { CsvUtilitiesService } from '../utils/csv-utilities.service';

@Injectable()
export class CsvService {
  constructor(
    @InjectRepository(Record)
    private readonly recordRepository: Repository<Record>,
    @Inject('REQUEST') private readonly request: Request,
    private readonly csvUtilitiesService: CsvUtilitiesService,
  ) {}

  async uploadCsv(file: Express.Multer.File, userId: number) {
    try {
      const csvRows = await this.csvUtilitiesService.parseCSV(file);
      const records = csvRows.map((row) => {
        return { ...row, user: { id: userId } };
      });

      await this.recordRepository.save(records);
    } catch (e) {
      if (e.detail && e.code) {
        // Database logic errors (e.g. duplicated record, foreign key constraint).
        throw new HttpException(e.detail, HttpStatus.BAD_REQUEST);
      }
      throw new HttpException(errorUnableToInsertCsv, HttpStatus.BAD_REQUEST);
    }
  }

  async getRecords(userId: number) {
    return this.recordRepository.find({
      where: { user: { id: userId } },
    } as object);
  }

  async getRecordByCode(code: string, userId: number) {
    const record = await this.recordRepository.findOne({
      where: { code, user: { id: userId } },
    } as object);

    if (record) {
      return record;
    }

    throw new HttpException(msgNoRecordFound, HttpStatus.NOT_FOUND);
  }

  async deleteRecords(userId: number) {
    return this.recordRepository.delete({ user: { id: userId } } as object);
  }
}
