import { Injectable } from '@nestjs/common';
import { parse, Options as csvParseOptions } from 'csv-parse';

type bufferObject = { type: 'buffer'; data: number[] };

@Injectable()
export class CsvUtilitiesService {
  async parseCSV(
    file: Express.Multer.File | bufferObject | string,
    options?: { bom?: boolean; columns?: boolean },
  ): Promise<object[]> {
    const bom = typeof options?.bom === 'boolean' ? options.bom : true;
    const columns =
      typeof options?.columns === 'boolean' ? options.columns : true;
    const parser = parse({ bom, columns } as csvParseOptions);
    const rows = [];

    let fileString: string;
    if (typeof file === 'string') {
      fileString = file;
    } else if ('buffer' in file && file.buffer instanceof Buffer) {
      fileString = file.buffer.toString('utf8');
    } else if ('data' in file && Array.isArray(file.data)) {
      const buffer = Buffer.from(file.data);
      fileString = buffer.toString('utf8');
    }

    fileString.split('\n').forEach((line) => parser.write(line));
    parser.end();

    parser.on('readable', () => {
      let row;
      while ((row = parser.read())) {
        rows.push(row);
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

    return rows;
  }
}
