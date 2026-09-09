import { Router } from 'express';
import { createFaq, deleteFaq, getFaq, listFaqs, updateFaq } from '../../controllers/faqController';
import { authMiddleware } from '../../middlewares/auth';
import { requireProductAccess } from '../../middlewares/requireProductAccess';
import { requireRole } from '../../middlewares/requireRole';
import { validate } from '../../middlewares/validate';
import { faqCreateSchema, faqListQuerySchema, faqUpdateSchema } from '../../validators/faq';

const router = Router();

router.use(authMiddleware, requireRole('SUPER_ADMIN', 'PRODUCT_ADMIN'), requireProductAccess);

router.get('/', validate(faqListQuerySchema, 'query'), listFaqs);
router.post('/', validate(faqCreateSchema), createFaq);
router.get('/:id', getFaq);
router.put('/:id', validate(faqUpdateSchema), updateFaq);
router.delete('/:id', deleteFaq);

export default router;
