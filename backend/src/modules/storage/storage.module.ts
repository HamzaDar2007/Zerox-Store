import { Global, Module } from '@nestjs/common';
import { StorageService } from '../../common/services/storage.service';
import { UploadController } from './upload.controller';

@Global()
@Module({
  providers: [StorageService],
  controllers: [UploadController],
  exports: [StorageService],
})
export class StorageModule {}
