import { Router } from 'express';
import authRoutes from './auth';
import adminArticleRoutes from './admin/articles';
import adminPageRoutes from './admin/pages';
import adminFaqRoutes from './admin/faqs';
import adminServiceRoutes from './admin/services';
import adminIndustryRoutes from './admin/industries';
import adminMediaRoutes from './admin/media';
import publicArticleRoutes from './public/articles';
import publicPageRoutes from './public/pages';
import publicFaqRoutes from './public/faqs';
import publicServiceRoutes from './public/services';
import publicIndustryRoutes from './public/industries';

const router = Router();

router.use('/auth', authRoutes);

router.use('/admin/articles', adminArticleRoutes);
router.use('/admin/pages', adminPageRoutes);
router.use('/admin/faqs', adminFaqRoutes);
router.use('/admin/services', adminServiceRoutes);
router.use('/admin/industries', adminIndustryRoutes);
router.use('/admin/media', adminMediaRoutes);

router.use('/public/articles', publicArticleRoutes);
router.use('/public/pages', publicPageRoutes);
router.use('/public/faqs', publicFaqRoutes);
router.use('/public/services', publicServiceRoutes);
router.use('/public/industries', publicIndustryRoutes);

export default router;
