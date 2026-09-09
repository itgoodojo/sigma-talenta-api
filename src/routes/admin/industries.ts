import { Router } from 'express';
import {
  createIndustry,
  deleteIndustry,
  getIndustry,
  listIndustries,
  updateIndustry,
} from '../../controllers/industryController';
import { authMiddleware } from '../../middlewares/auth';
import { requireProductAccess } from '../../middlewares/requireProductAccess';
import { requireRole } from '../../middlewares/requireRole';
import { validate } from '../../middlewares/validate';
import {
  industryCreateSchema,
  industryListQuerySchema,
  industryUpdateSchema,
} from '../../validators/industry';

const router = Router();

router.use(authMiddleware, requireRole('SUPER_ADMIN', 'PRODUCT_ADMIN'), requireProductAccess);

router.get('/', validate(industryListQuerySchema, 'query'), listIndustries);
router.post('/', validate(industryCreateSchema), createIndustry);
router.get('/:id', getIndustry);
router.put('/:id', validate(industryUpdateSchema), updateIndustry);
router.delete('/:id', deleteIndustry);

export default router;
