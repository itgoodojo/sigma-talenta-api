import { Router } from 'express';
import { loginHandler, logoutHandler, meHandler } from '../controllers/authController';
import { authMiddleware } from '../middlewares/auth';
import { validate } from '../middlewares/validate';
import { loginSchema } from '../validators/auth';

const router = Router();

router.post('/login', validate(loginSchema), loginHandler);
router.get('/me', authMiddleware, meHandler);
router.post('/logout', authMiddleware, logoutHandler);

export default router;
