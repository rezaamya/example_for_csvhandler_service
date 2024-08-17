import { Test, TestingModule } from '@nestjs/testing';
import { RabbitMQService } from './rabbitmq.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Record } from '../csv/record.entity';
import { User } from '../users/user.entity';
import { CsvUtilitiesService } from '../utils/csv-utilities.service';
import { ConfigService } from '@nestjs/config';
import { Channel } from 'amqplib';

describe('RabbitMQService', () => {
  let rabbitMQService: RabbitMQService;
  // let recordRepository: Repository<Record>;
  // let csvUtilitiesService: CsvUtilitiesService;
  // let channel: Channel;

  const csvString = 'code,fname,lname\n1,Reza,Amya\n2,Azi,Amya';
  const expectedCsvRows = [
    { code: '1', fname: 'Reza', lname: 'Amya' },
    { code: '2', fname: 'Azi', lname: 'Amya' },
  ];
  const expectedRecordRows = [
    { code: '1', fname: 'Reza', lname: 'Amya', user: { id: 1 } },
    { code: '2', fname: 'Azi', lname: 'Amya', user: { id: 1 } },
  ];
  const file = {
    buffer: Buffer.from(csvString),
    mimetype: 'text/csv',
  } as Express.Multer.File;

  const fileOverQueue = {
    buffer: Buffer.from(csvString).toJSON(),
    mimetype: 'text/csv',
  };

  const userId = 1;

  const mockRecordRepository = {
    insert: jest.fn(),
  };

  const mockCsvUtilitiesService = {
    parseCSV: jest.fn(),
  };

  const mockChannel = {
    consume: jest.fn().mockImplementation((queue, callback) => {
      // Simulate receiving a message
      const message = {
        content: Buffer.from(JSON.stringify({ userId: userId, file })),
      };
      callback(message);
    }),
    ack: jest.fn(),
    nack: jest.fn(),
    sendToQueue: jest.fn(),
  } as unknown as Channel;

  const mockConfigService = {
    get: jest.fn().mockReturnValue({
      username: 'guest',
      password: 'guest',
      host: 'localhost',
      port: 5672,
    }),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RabbitMQService,
        {
          provide: getRepositoryToken(Record),
          useValue: mockRecordRepository,
        },
        {
          provide: getRepositoryToken(User),
          useValue: {},
        },
        {
          provide: CsvUtilitiesService,
          useValue: mockCsvUtilitiesService,
        },
        {
          provide: ConfigService,
          useValue: mockConfigService,
        },
      ],
    }).compile();

    rabbitMQService = module.get<RabbitMQService, RabbitMQService>(
      RabbitMQService,
    );
    // recordRepository = module.get<Repository<Record>, Repository<Record>>(
    //   getRepositoryToken(Record),
    // );
    // csvUtilitiesService = module.get<CsvUtilitiesService, CsvUtilitiesService>(
    //   CsvUtilitiesService,
    // );
    rabbitMQService['channel'] = mockChannel; // Set the mocked channel
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should process messages from queue1 and insert records', async () => {
    mockCsvUtilitiesService.parseCSV.mockResolvedValue(expectedCsvRows);

    await rabbitMQService.listenToQueue1();

    expect(mockCsvUtilitiesService.parseCSV).toHaveBeenCalledWith(
      fileOverQueue,
    );
    expect(mockRecordRepository.insert).toHaveBeenCalledWith(
      expectedRecordRows,
    );
    expect(mockChannel.ack).toHaveBeenCalled();
  });

  it('should handle errors and ack the message for logic errors', async () => {
    const expectedError = {
      detail: 'Duplicate',
      code: '23505',
    };

    mockCsvUtilitiesService.parseCSV.mockResolvedValue(expectedCsvRows);
    mockRecordRepository.insert.mockRejectedValueOnce(expectedError); // Simulate a duplicate error

    await rabbitMQService.listenToQueue1();

    expect(mockChannel.ack).toHaveBeenCalledTimes(1); // Should ack on logic error
  });

  it('should nack the message for other errors', async () => {
    mockCsvUtilitiesService.parseCSV.mockResolvedValue(expectedCsvRows);
    mockRecordRepository.insert.mockRejectedValueOnce(
      new Error('Some other error'),
    ); // Simulate a different error

    await rabbitMQService.listenToQueue1();

    expect(mockChannel.nack).toHaveBeenCalledTimes(1); // Should nack on other errors
  });

  it('should process messages from queue2 and send data to queue3', async () => {
    mockCsvUtilitiesService.parseCSV.mockResolvedValue(expectedCsvRows);

    await rabbitMQService.listenToQueue2();

    expect(mockCsvUtilitiesService.parseCSV).toHaveBeenCalledWith(
      fileOverQueue,
    );
    expect(mockChannel.sendToQueue).toHaveBeenCalledTimes(2);
    expect(mockChannel.sendToQueue).toHaveBeenNthCalledWith(
      1,
      'queue3',
      Buffer.from(
        JSON.stringify({
          ...expectedCsvRows[0],
          user: { id: userId },
        }),
      ),
    );
    expect(mockChannel.sendToQueue).toHaveBeenNthCalledWith(
      2,
      'queue3',
      Buffer.from(
        JSON.stringify({
          ...expectedCsvRows[1],
          user: { id: userId },
        }),
      ),
    );
    expect(mockChannel.ack).toHaveBeenCalled();
  });

  it('should nack the message for errors during processing in queue2', async () => {
    mockCsvUtilitiesService.parseCSV.mockResolvedValue(expectedCsvRows);

    mockChannel.sendToQueue = jest.fn().mockImplementation(() => {
      throw new Error('Failed to send to queue3');
    });

    await rabbitMQService.listenToQueue2();

    expect(mockChannel.nack).toHaveBeenCalledTimes(1);
    expect(mockChannel.nack).toHaveBeenNthCalledWith(
      1,
      expect.anything(),
      false,
      true,
    );
  });

  it('should process messages from queue3 and insert records', async () => {
    const message = {
      content: Buffer.from(JSON.stringify(expectedRecordRows[0])),
    };

    mockChannel.consume = jest.fn().mockImplementation((queue, callback) => {
      callback(message);
    });

    await rabbitMQService.listenToQueue3();

    expect(mockRecordRepository.insert).toHaveBeenCalledWith(
      expectedRecordRows[0],
    );
    expect(mockChannel.ack).toHaveBeenCalledTimes(1);
  });

  it('should nack the message for errors during insertion in queue3', async () => {
    const message = {
      content: Buffer.from(JSON.stringify(expectedRecordRows[0])),
    };

    mockChannel.consume = jest.fn().mockImplementation((queue, callback) => {
      callback(message);
    });

    mockRecordRepository.insert.mockRejectedValueOnce(
      new Error('Insertion error'),
    );

    await rabbitMQService.listenToQueue3();

    expect(mockChannel.nack).toHaveBeenCalled();
  });
});
