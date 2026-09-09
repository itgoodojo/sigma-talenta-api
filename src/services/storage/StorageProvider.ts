export interface UploadInput {
  key: string;
  body: Buffer;
  contentType: string;
}

export interface StorageProvider {
  upload(file: UploadInput): Promise<string>; // returns a public URL
  delete(key: string): Promise<void>;
  getUrl(key: string): string;
}
