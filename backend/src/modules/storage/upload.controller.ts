import {
  Controller,
  Post,
  UploadedFile,
  UploadedFiles,
  UseGuards,
  UseInterceptors,
  Query,
  BadRequestException,
} from '@nestjs/common';
import { FileInterceptor, FilesInterceptor } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { StorageService } from '../../common/services/storage.service';
import {
  ApiTags,
  ApiConsumes,
  ApiBody,
  ApiBearerAuth,
  ApiOperation,
  ApiQuery,
  ApiResponse,
} from '@nestjs/swagger';

@ApiTags('Upload')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('upload')
export class UploadController {
  private static readonly ALLOWED_FOLDERS = [
    'products',
    'avatars',
    'categories',
    'stores',
    'general',
  ];

  constructor(private readonly storage: StorageService) {}

  private validateFolder(folder: string): void {
    if (!UploadController.ALLOWED_FOLDERS.includes(folder)) {
      throw new BadRequestException(
        `Invalid folder. Allowed: ${UploadController.ALLOWED_FOLDERS.join(', ')}`,
      );
    }
  }

  @Post('image')
  @ApiOperation({ summary: 'Upload a single image to Cloudflare R2' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: { file: { type: 'string', format: 'binary' } },
    },
  })
  @ApiQuery({ name: 'folder', required: false, example: 'products' })
  @ApiResponse({ status: 201, description: 'Image uploaded successfully' })
  @ApiResponse({ status: 400, description: 'Invalid folder or file' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @UseInterceptors(
    FileInterceptor('file', {
      storage: memoryStorage(),
      limits: { fileSize: 5 * 1024 * 1024 },
    }),
  )
  async uploadImage(
    @UploadedFile() file: Express.Multer.File,
    @Query('folder') folder = 'general',
  ) {
    this.validateFolder(folder);
    const url = await this.storage.upload(file, folder);
    return { url };
  }

  @Post('images')
  @ApiOperation({ summary: 'Upload multiple images to Cloudflare R2' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        files: {
          type: 'array',
          items: { type: 'string', format: 'binary' },
        },
      },
    },
  })
  @ApiQuery({ name: 'folder', required: false, example: 'products' })
  @ApiResponse({ status: 201, description: 'Images uploaded successfully' })
  @ApiResponse({ status: 400, description: 'Invalid folder or file' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @UseInterceptors(
    FilesInterceptor('files', 10, {
      storage: memoryStorage(),
      limits: { fileSize: 5 * 1024 * 1024 },
    }),
  )
  async uploadImages(
    @UploadedFiles() files: Express.Multer.File[],
    @Query('folder') folder = 'general',
  ) {
    if (!files || files.length === 0) {
      throw new BadRequestException('No files provided');
    }
    this.validateFolder(folder);
    const urls = await this.storage.uploadMany(files, folder);
    return { urls };
  }
}
