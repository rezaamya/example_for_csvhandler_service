import {
  Controller,
  Post,
  Get,
  Delete,
  Param,
  UploadedFile,
  UseGuards,
  UseInterceptors,
  Req,
  ParseFilePipe,
  MaxFileSizeValidator,
  FileTypeValidator,
} from '@nestjs/common';
import { CsvService } from './csv.service';
import { AuthGuard } from '../../guards/auth.guard';
import { FileInterceptor } from '@nestjs/platform-express';
import {
  msgFileUploadedSuccessfully,
  msgRecordsDeletedSuccessfully,
} from './csv.msg';
import {
  DeleteRecordsResponseDto,
  GetRecordByCodeRequestParamDto,
  UploadCsvResponseDto,
} from './csv.dto';
import { Record } from './record.entity';

@Controller('csv')
@UseGuards(AuthGuard)
export class CsvController {
  constructor(private readonly csvService: CsvService) {}

  @Post()
  @UseInterceptors(FileInterceptor('file'))
  async uploadCsv(
    @UploadedFile(
      new ParseFilePipe({
        validators: [
          new MaxFileSizeValidator({ maxSize: 1000 * 1024 }),
          new FileTypeValidator({ fileType: 'text/csv' }),
        ],
      }),
    )
    file: Express.Multer.File,
    @Req() req,
  ): Promise<UploadCsvResponseDto> {
    await this.csvService.uploadCsv(file, req.user.id);
    return { message: msgFileUploadedSuccessfully };
  }

  @Get()
  async getRecords(@Req() req): Promise<Record[]> {
    return this.csvService.getRecords(req.user.id);
  }

  @Get(':code')
  async getRecordByCode(
    @Param() param: GetRecordByCodeRequestParamDto,
    @Req() req,
  ): Promise<Record> {
    return this.csvService.getRecordByCode(param.code, req.user.id);
  }

  @Delete()
  async deleteRecords(@Req() req): Promise<DeleteRecordsResponseDto> {
    await this.csvService.deleteRecords(req.user.id);
    return { message: msgRecordsDeletedSuccessfully };
  }
}
