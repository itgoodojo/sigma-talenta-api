import { Router } from 'express';
import {
  deleteMediaHandler,
  getMedia,
  listMedia,
  uploadMediaHandler,
} from '../../controllers/mediaController';
import { authMiddleware } from '../../middlewares/auth';
import { requireProductAccess } from '../../middlewares/requireProductAccess';
import { requireRole } from '../../middlewares/requireRole';
import { uploadSingleFile } from '../../middlewares/upload';

const router = Router();

router.use(authMiddleware, requireRole('SUPER_ADMIN', 'PRODUCT_ADMIN'), requireProductAccess);

router.get('/', listMedia);
router.post('/', uploadSingleFile, uploadMediaHandler);
router.get('/:id', getMedia);
router.delete('/:id', deleteMediaHandler);

export default router;
