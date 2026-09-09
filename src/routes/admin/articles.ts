import { Router } from 'express';
import {
  createArticle,
  deleteArticle,
  getArticle,
  listArticles,
  updateArticle,
} from '../../controllers/articleController';
import { authMiddleware } from '../../middlewares/auth';
import { requireProductAccess } from '../../middlewares/requireProductAccess';
import { requireRole } from '../../middlewares/requireRole';
import { validate } from '../../middlewares/validate';
import {
  articleCreateSchema,
  articleListQuerySchema,
  articleUpdateSchema,
} from '../../validators/article';

const router = Router();

router.use(authMiddleware, requireRole('SUPER_ADMIN', 'PRODUCT_ADMIN'), requireProductAccess);

router.get('/', validate(articleListQuerySchema, 'query'), listArticles);
router.post('/', validate(articleCreateSchema), createArticle);
router.get('/:id', getArticle);
router.put('/:id', validate(articleUpdateSchema), updateArticle);
router.delete('/:id', deleteArticle);

export default router;
