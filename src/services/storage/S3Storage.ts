import { DeleteObjectCommand, PutObjectCommand, S3Client } from '@aws-sdk/client-s3';
import { env } from '../../config/env';
import type { StorageProvider, UploadInput } from './StorageProvider';

export class S3Storage implements StorageProvider {
  private client: S3Client;
  private bucket: string;
  private publicUrl: string;

  constructor() {
    this.bucket = env.storage.bucket;
    this.publicUrl = env.storage.publicUrl.replace(/\/$/, '');
    this.client = new S3Client({
      endpoint: env.storage.endpoint,
      region: env.storage.region || 'auto',
      credentials: {
        accessKeyId: env.storage.accessKey,
        secretAccessKey: env.storage.secretKey,
      },
    });
  }

  async upload(file: UploadInput): Promise<string> {
    await this.client.send(
      new PutObjectCommand({
        Bucket: this.bucket,
        Key: file.key,
        Body: file.body,
        ContentType: file.contentType,
      }),
    );
    return this.getUrl(file.key);
  }

  async delete(key: string): Promise<void> {
    await this.client.send(new DeleteObjectCommand({ Bucket: this.bucket, Key: key }));
  }

  getUrl(key: string): string {
    if (this.publicUrl) return `${this.publicUrl}/${key}`;
    return `${env.storage.endpoint.replace(/\/$/, '')}/${this.bucket}/${key}`;
  }
}
