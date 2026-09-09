import { env } from '../../config/env';
import { LocalStorage } from './LocalStorage';
import { S3Storage } from './S3Storage';
import type { StorageProvider } from './StorageProvider';

function createStorage(): StorageProvider {
  const { endpoint, accessKey, secretKey, bucket } = env.storage;
  if (endpoint && accessKey && secretKey && bucket) {
    return new S3Storage();
  }
  return new LocalStorage();
}

export const storage: StorageProvider = createStorage();
export type { StorageProvider } from './StorageProvider';
