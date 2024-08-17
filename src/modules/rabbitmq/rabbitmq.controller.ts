import {
  Controller,
  Post,
  Body,
  UploadedFile,
  ParseFilePipe,
  MaxFileSizeValidator,
  FileTypeValidator,
  UseInterceptors,
} from '@nestjs/common';
import { RabbitMQProducerService } from './rabbitmq.producer.service';
import { FileInterceptor } from '@nestjs/platform-express';

@Controller('messages')
export class MessagesController {
  constructor(
    private readonly rabbitMQProducerService: RabbitMQProducerService,
  ) {}

  @Post('/file')
  @UseInterceptors(FileInterceptor('file'))
  async sendFile(
    @UploadedFile(
      new ParseFilePipe({
        validators: [
          new MaxFileSizeValidator({ maxSize: 1000 * 1024 }),
          new FileTypeValidator({ fileType: 'text/csv' }),
        ],
      }),
    )
    file: Express.Multer.File,
    @Body() body: { userId: number; queueName: string },
  ) {
    await this.rabbitMQProducerService.sendMessageWithAFile(body.queueName, {
      userId: +body.userId,
      file: file.buffer,
    });

    return {
      message: `Sent message: to ${body.queueName}`,
    };
  }

  @Post('queue3')
  async sendMessageToQueue3(@Body() body: { message: string }) {
    await this.rabbitMQProducerService.sendMessageToQueue3(body.message);
  }
}
