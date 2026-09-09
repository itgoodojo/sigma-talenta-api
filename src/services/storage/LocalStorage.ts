import { promises as fs } from 'fs';
import path from 'path';
import type { StorageProvider, UploadInput } from './StorageProvider';

// Development-only provider. Stores files on the local filesystem and serves
// them under /uploads. Used automatically when no S3/R2 credentials are set.
export class LocalStorage implements StorageProvider {
  private dir = path.resolve(process.cwd(), 'uploads');

  async upload(file: UploadInput): Promise<string> {
    const fullPath = path.join(this.dir, file.key);
    await fs.mkdir(path.dirname(fullPath), { recursive: true });
    await fs.writeFile(fullPath, file.body);
    return this.getUrl(file.key);
  }

  async delete(key: string): Promise<void> {
    await fs.rm(path.join(this.dir, key), { force: true });
  }

  getUrl(key: string): string {
    return `/uploads/${key}`;
  }
}
