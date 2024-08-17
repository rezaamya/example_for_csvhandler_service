import { Test, TestingModule } from '@nestjs/testing';
import { CsvUtilitiesService } from './csv-utilities.service';
import { parse } from 'csv-parse';

jest.mock('csv-parse', () => ({
  parse: jest.fn(),
}));

describe('CsvUtilitiesService', () => {
  let service: CsvUtilitiesService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [CsvUtilitiesService],
    }).compile();

    service = module.get<CsvUtilitiesService, CsvUtilitiesService>(
      CsvUtilitiesService,
    );
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('parseCSV', () => {
    it('should parse CSV from a buffer', async () => {
      const mockFile = {
        buffer: Buffer.from('code,fname,lname\n1,r,a\n2,n,s\n3,s,a\n'),
        originalname: 'test.csv',
      } as Express.Multer.File;

      const mockParsedData = [
        { code: '1', fname: 'r', lname: 'a' },
        { code: '2', fname: 'n', lname: 's' },
        { code: '3', fname: 's', lname: 'a' },
      ];

      const expectedResult = [...mockParsedData];

      (parse as jest.Mock).mockImplementation((input, options) => {
        return {
          write: jest.fn(),
          read: jest.fn(() => mockParsedData.shift()), // Simulate reading rows
          end: jest.fn(),
          on: (event, callback) => {
            if (event === 'readable') {
              mockParsedData.forEach((row) => {
                callback(row); // Simulate readable event
              });
            }
            if (event === 'end') {
              callback();
            }
            if (event === 'error') {
            }
          },
        };
      });

      const result = await service.parseCSV(mockFile);

      expect(result).toEqual(expectedResult);
    });

    it('should throw an error when parsing fails', async () => {
      const mockFile = {
        buffer: Buffer.from('invalid,csv,data\n'),
        originalname: 'test.csv',
      } as Express.Multer.File;

      (parse as jest.Mock).mockImplementation((input, options) => {
        return {
          write: jest.fn(),
          read: jest.fn(), // Simulate reading rows
          end: jest.fn(),
          on: (event, callback) => {
            if (event === 'readable') {
              callback();
            }
            if (event === 'end') {
              callback();
            }
            if (event === 'error') {
              callback(new Error('Parsing error')); // Simulate an error
            }
          },
        };
      });

      await expect(service.parseCSV(mockFile)).rejects.toThrow('Parsing error');
    });
  });
});
