import { Router } from 'express';
import {
  createLandingPage,
  deleteLandingPage,
  getLandingPage,
  listLandingPages,
  updateLandingPage,
} from '../../controllers/landingPageController';
import { authMiddleware } from '../../middlewares/auth';
import { requireProductAccess } from '../../middlewares/requireProductAccess';
import { requireRole } from '../../middlewares/requireRole';
import { validate } from '../../middlewares/validate';
import {
  landingPageCreateSchema,
  landingPageListQuerySchema,
  landingPageUpdateSchema,
} from '../../validators/landingPage';

const router = Router();

router.use(authMiddleware, requireRole('SUPER_ADMIN', 'PRODUCT_ADMIN'), requireProductAccess);

router.get('/', validate(landingPageListQuerySchema, 'query'), listLandingPages);
router.post('/', validate(landingPageCreateSchema), createLandingPage);
router.get('/:id', getLandingPage);
router.put('/:id', validate(landingPageUpdateSchema), updateLandingPage);
router.delete('/:id', deleteLandingPage);

export default router;
