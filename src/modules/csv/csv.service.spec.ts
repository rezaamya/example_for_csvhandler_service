import { Test, TestingModule } from '@nestjs/testing';
import { CsvService } from './csv.service';
import { CsvUtilitiesService } from '../utils/csv-utilities.service';
import { Repository } from 'typeorm';
import { Record } from './record.entity';
import { errorUnableToInsertCsv, msgNoRecordFound } from './csv.msg';
import { HttpException, HttpStatus } from '@nestjs/common';

describe('CsvService', () => {
  let csvService: CsvService;
  let csvUtilitiesService: CsvUtilitiesService;
  let recordRepository: Repository<Record>;

  const csvString = 'code,fname,lname\n1,Reza,Amya\n2,Azi,Amya';
  const expectedCsvRows = [
    { code: '1', fname: 'Reza', lname: 'Amya' },
    { code: '2', fname: 'Azi', lname: 'Amya' },
  ];
  const expectedRecordRows = [
    { id: 1, code: '1', fname: 'Reza', lname: 'Amya', user: { id: 1 } },
    { id: 2, code: '2', fname: 'Azi', lname: 'Amya', user: { id: 1 } },
  ];
  const file = {
    buffer: Buffer.from(csvString),
    mimetype: 'text/csv',
  } as Express.Multer.File;
  const userId = 1;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [Repository, CsvUtilitiesService],
    }).compile();

    csvUtilitiesService = module.get<CsvUtilitiesService, CsvUtilitiesService>(
      CsvUtilitiesService,
    );
    recordRepository = module.get<Repository<Record>, Repository<Record>>(
      Repository,
    );

    csvService = new CsvService(recordRepository, csvUtilitiesService);
  });

  it('should be defined', () => {
    expect(csvService).toBeDefined();
  });

  it('should upload csv file', async () => {
    csvUtilitiesService.parseCSV = jest.fn().mockResolvedValue(expectedCsvRows);

    recordRepository.save = jest.fn().mockResolvedValue(expectedRecordRows);

    await csvService.uploadCsv(file, userId);

    expect(csvUtilitiesService.parseCSV).toHaveBeenCalledTimes(1);
    expect(recordRepository.save).toHaveBeenCalledTimes(1);
  });

  it('should throw error if unable to insert csv', async () => {
    csvUtilitiesService.parseCSV = jest.fn().mockResolvedValue(expectedCsvRows);

    recordRepository.save = jest.fn().mockImplementation(() => {
      throw new Error('Error inserting csv');
    });

    await expect(csvService.uploadCsv(file, userId)).rejects.toThrowError(
      new HttpException(errorUnableToInsertCsv, HttpStatus.BAD_REQUEST),
    );
  });

  it('should return records for a given userId', async () => {
    recordRepository.find = jest.fn().mockResolvedValue(expectedRecordRows);

    const records = await csvService.getRecords(userId);

    expect(recordRepository.find).toHaveBeenCalledTimes(1);
    expect(records).toEqual(expectedRecordRows);
  });

  it('should return a record for a given code and userId', async () => {
    recordRepository.findOne = jest
      .fn()
      .mockResolvedValue(expectedRecordRows[0]);

    const record = await csvService.getRecordByCode(
      expectedRecordRows[0].code,
      userId,
    );

    expect(recordRepository.findOne).toHaveBeenCalledWith({
      where: { code: expectedRecordRows[0].code, user: { id: userId } },
    });
    expect(record).toEqual(expectedRecordRows[0]);
  });

  it('should throw an error if no record is found', async () => {
    const code = 'non-existent-code';

    recordRepository.findOne = jest.fn().mockResolvedValue(null);

    await expect(csvService.getRecordByCode(code, userId)).rejects.toThrowError(
      new HttpException(msgNoRecordFound, HttpStatus.NOT_FOUND),
    );
  });

  it('should delete records for a given userId', async () => {
    recordRepository.delete = jest.fn().mockResolvedValue({ affected: 1 });

    const result = await csvService.deleteRecords(userId);

    expect(recordRepository.delete).toHaveBeenCalledWith({
      user: { id: userId },
    });
    expect(result).toEqual({ affected: 1 });
  });
});
