import { Router } from 'express';
import { publicGetIndustry, publicListIndustries } from '../../controllers/industryController';
import { resolveProduct } from '../../middlewares/resolveProduct';
import { validate } from '../../middlewares/validate';
import { industryPublicListQuerySchema } from '../../validators/industry';

const router = Router();

router.use(resolveProduct);
router.get('/', validate(industryPublicListQuerySchema, 'query'), publicListIndustries);
router.get('/:slug', publicGetIndustry);

export default router;
