import { Router } from 'express';
import { publicGetLandingPage } from '../../controllers/landingPageController';
import { resolveProduct } from '../../middlewares/resolveProduct';

const router = Router();

router.use(resolveProduct);
router.get('/:slug', publicGetLandingPage);

export default router;
