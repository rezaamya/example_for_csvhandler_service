import { IsNotEmpty, IsNumberString } from 'class-validator';
import { msgCodeRequirements } from './csv.msg';

export class UploadCsvResponseDto {
  message: string;
}

export class GetRecordByCodeRequestParamDto {
  @IsNotEmpty({ message: msgCodeRequirements })
  @IsNumberString({}, { message: msgCodeRequirements })
  code: string;
}

export class DeleteRecordsResponseDto extends UploadCsvResponseDto {}
