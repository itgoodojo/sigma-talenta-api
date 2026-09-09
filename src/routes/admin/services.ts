import { Router } from 'express';
import {
  createService,
  deleteService,
  getService,
  listServices,
  updateService,
} from '../../controllers/serviceController';
import { authMiddleware } from '../../middlewares/auth';
import { requireProductAccess } from '../../middlewares/requireProductAccess';
import { requireRole } from '../../middlewares/requireRole';
import { validate } from '../../middlewares/validate';
import { serviceCreateSchema, serviceListQuerySchema, serviceUpdateSchema } from '../../validators/service';

const router = Router();

router.use(authMiddleware, requireRole('SUPER_ADMIN', 'PRODUCT_ADMIN'), requireProductAccess);

router.get('/', validate(serviceListQuerySchema, 'query'), listServices);
router.post('/', validate(serviceCreateSchema), createService);
router.get('/:id', getService);
router.put('/:id', validate(serviceUpdateSchema), updateService);
router.delete('/:id', deleteService);

export default router;
