import { Router } from 'express';
import { publicListFaqs } from '../../controllers/faqController';
import { resolveProduct } from '../../middlewares/resolveProduct';
import { validate } from '../../middlewares/validate';
import { faqPublicListQuerySchema } from '../../validators/faq';

const router = Router();

router.use(resolveProduct);
router.get('/', validate(faqPublicListQuerySchema, 'query'), publicListFaqs);

export default router;
