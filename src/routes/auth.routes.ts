import { Router } from 'express';
import { AuthController } from '../controllers/auth.controller';
import { authenticate } from '../middleware/auth.middleware';
import { asyncHandler } from '../middleware/errorHandler';

const router = Router();

router.post('/register', asyncHandler(AuthController.register));
router.post('/login', asyncHandler(AuthController.login));
router.post('/logout', authenticate, asyncHandler(AuthController.logout));
router.get('/profile', authenticate, asyncHandler(AuthController.getProfile));
router.put('/profile', authenticate, asyncHandler(AuthController.updateProfile));

export default router;
