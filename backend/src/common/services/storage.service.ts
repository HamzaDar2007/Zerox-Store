import {
  Injectable,
  BadRequestException,
  InternalServerErrorException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  S3Client,
  PutObjectCommand,
  DeleteObjectCommand,
  HeadBucketCommand,
} from '@aws-sdk/client-s3';
import { SafeLogger } from '../utils/logger.util';
import { withRetry } from '../utils/retry.util';

@Injectable()
export class StorageService {
  private s3: S3Client;
  private bucket: string;
  private publicUrl: string;

  private static readonly MAX_FILE_SIZE = 5 * 1024 * 1024; // 5 MB
  private static readonly ALLOWED_MIME_TYPES = [
    'image/jpeg',
    'image/png',
    'image/webp',
    'image/gif',
    'image/svg+xml',
  ];

  constructor(private config: ConfigService) {
    this.bucket = this.config.get<string>('R2_BUCKET_NAME');
    this.publicUrl = this.config.get<string>('R2_PUBLIC_URL');

    this.s3 = new S3Client({
      region: 'auto',
      endpoint: this.config.get<string>('R2_ENDPOINT'),
      credentials: {
        accessKeyId: this.config.get<string>('R2_ACCESS_KEY_ID'),
        secretAccessKey: this.config.get<string>('R2_SECRET_ACCESS_KEY'),
      },
    });
  }

  /**
   * Upload a file to Cloudflare R2 and return its public URL.
   * @param file  Multer file buffer
   * @param folder  Logical folder inside the bucket (e.g. "products", "categories")
   */
  async upload(file: Express.Multer.File, folder: string): Promise<string> {
    this.validateFile(file);

    const ext = file.originalname.split('.').pop()?.toLowerCase() || 'bin';
    const key = `${folder}/${Date.now()}-${Math.random().toString(36).slice(2, 10)}.${ext}`;

    try {
      await withRetry(
        () =>
          this.s3.send(
            new PutObjectCommand({
              Bucket: this.bucket,
              Key: key,
              Body: file.buffer,
              ContentType: file.mimetype,
              CacheControl: 'public, max-age=31536000',
            }),
          ),
        3,
        500,
        'StorageService.upload',
      );

      const url = `${this.publicUrl}/${key}`;
      SafeLogger.log(`Uploaded: ${url}`, 'StorageService');
      return url;
    } catch (err) {
      SafeLogger.error(`R2 upload failed: ${err.message}`, 'StorageService');
      throw new InternalServerErrorException('Failed to upload file');
    }
  }

  /**
   * Upload multiple files in parallel.
   */
  async uploadMany(
    files: Express.Multer.File[],
    folder: string,
  ): Promise<string[]> {
    return Promise.all(files.map((f) => this.upload(f, folder)));
  }

  /**
   * Delete a file from R2 by its public URL.
   */
  async delete(fileUrl: string): Promise<void> {
    if (!fileUrl) return;
    const key = this.extractKey(fileUrl);
    if (!key) return;

    try {
      await this.s3.send(
        new DeleteObjectCommand({ Bucket: this.bucket, Key: key }),
      );
      SafeLogger.log(`Deleted: ${key}`, 'StorageService');
    } catch (err) {
      SafeLogger.error(`R2 delete failed: ${err.message}`, 'StorageService');
    }
  }

  /**
   * Verify R2 connectivity.
   */
  async testConnection(): Promise<boolean> {
    try {
      await this.s3.send(new HeadBucketCommand({ Bucket: this.bucket }));
      return true;
    } catch {
      return false;
    }
  }

  // ─── helpers ───────────────────────────────────────────

  private validateFile(file: Express.Multer.File): void {
    if (!file) throw new BadRequestException('No file provided');

    if (file.size > StorageService.MAX_FILE_SIZE) {
      throw new BadRequestException('File size must be 5 MB or less');
    }

    if (!StorageService.ALLOWED_MIME_TYPES.includes(file.mimetype)) {
      throw new BadRequestException(
        'Only JPEG, PNG, WebP, GIF and SVG images are allowed',
      );
    }
  }

  private extractKey(url: string): string | null {
    if (!url.startsWith(this.publicUrl)) return null;
    return url.slice(this.publicUrl.length + 1); // strip base + leading /
  }
}
