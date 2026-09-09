import { Router } from 'express';
import { publicGetArticle, publicListArticles } from '../../controllers/articleController';
import { resolveProduct } from '../../middlewares/resolveProduct';
import { validate } from '../../middlewares/validate';
import { articlePublicListQuerySchema } from '../../validators/article';

const router = Router();

router.use(resolveProduct);

router.get('/', validate(articlePublicListQuerySchema, 'query'), publicListArticles);
router.get('/:slug', publicGetArticle);

export default router;
