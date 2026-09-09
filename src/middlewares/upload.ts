import type { NextFunction, Request, RequestHandler, Response } from 'express';
import multer from 'multer';
import { AppError } from './errorHandler';

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 }, // 10 MB
});

export const uploadSingleFile: RequestHandler = (req: Request, res: Response, next: NextFunction) => {
  upload.single('file')(req, res, (err: unknown) => {
    if (err instanceof multer.MulterError) {
      if (err.code === 'LIMIT_FILE_SIZE') {
        next(new AppError(413, 'FILE_TOO_LARGE', 'File exceeds the 10 MB limit'));
        return;
      }
      next(new AppError(400, 'UPLOAD_ERROR', err.message));
      return;
    }
    if (err) {
      next(err);
      return;
    }
    next();
  });
};
