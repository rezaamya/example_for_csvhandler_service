import { HttpException, HttpStatus, Inject, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Record } from './record.entity';
import { parse, Options as csvParseOptions } from 'csv-parse';
import { errorUnableToInsertCsv, msgNoRecordFound } from './csv.msg';

@Injectable()
export class CsvService {
  constructor(
    @InjectRepository(Record)
    private readonly recordRepository: Repository<Record>,
    @Inject('REQUEST') private readonly request: Request,
  ) {}

  async uploadCsv(file: Express.Multer.File, userId: number) {
    try {
      const records = [];
      const parser = parse({ bom: true, columns: true } as csvParseOptions);

      //TODO
      // Save the file on disk and read asynchronously
      // Currently file is as a buffer in memory, so there is no benefit here to store it on disk
      file.buffer
        .toString('utf8')
        .split('\n')
        .forEach((line) => parser.write(line));
      parser.end();

      parser.on('readable', () => {
        let record;
        while ((record = parser.read())) {
          records.push({ ...record, user: { id: userId } });
        }
      });

      parser.on('error', (err) => {
        console.error(err);
        throw err;
      });

      await new Promise((resolve) => {
        parser.on('end', async () => {
          resolve(true);
        });
      });

      await this.recordRepository.save(records);
    } catch (e) {
      if (e.detail && e.code === '23505') {
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
