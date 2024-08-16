import { Module } from '@nestjs/common';
import { CsvUtilitiesService } from './csv-utilities.service';

@Module({
  providers: [CsvUtilitiesService],
  exports: [CsvUtilitiesService],
})
export class UtilsModule {}
