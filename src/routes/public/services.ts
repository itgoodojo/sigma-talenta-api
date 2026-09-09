import { Router } from 'express';
import { publicGetService, publicListServices } from '../../controllers/serviceController';
import { resolveProduct } from '../../middlewares/resolveProduct';
import { validate } from '../../middlewares/validate';
import { servicePublicListQuerySchema } from '../../validators/service';

const router = Router();

router.use(resolveProduct);
router.get('/', validate(servicePublicListQuerySchema, 'query'), publicListServices);
router.get('/:slug', publicGetService);

export default router;
