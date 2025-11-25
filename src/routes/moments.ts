import { Router } from 'express';
import { MomentController } from '../controllers/moment.controller';
import { mockAuthMiddleware } from '../middleware/auth';

const router = Router();

// CRUD routes for moments (protected)
router.post('/moments', mockAuthMiddleware, MomentController.createMoment);
router.put('/moments/:id', mockAuthMiddleware, MomentController.updateMoment);
router.delete('/moments/:id', mockAuthMiddleware, MomentController.deleteMoment);

// Public routes
router.get('/moments/:id', MomentController.getMomentById);
router.get('/moments', MomentController.listMoments);
router.get('/moments/nearby', MomentController.findNearbyMoments);

export default router;