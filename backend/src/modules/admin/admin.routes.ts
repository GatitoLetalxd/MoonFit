import { Router } from 'express';
import { adminController } from './admin.controller';
import { authenticate } from '../../middlewares/auth.middleware';
import { requireAdmin } from '../../middlewares/admin.middleware';

const router = Router();

// Protect all admin routes
router.use(authenticate, requireAdmin);

router.get('/users', (req, res, next) => adminController.listUsers(req, res, next));
router.get('/users/:id', (req, res, next) => adminController.getUserDetail(req, res, next));
router.patch('/users/:id/status', (req, res, next) => adminController.toggleStatus(req, res, next));
router.post('/users/:id/change-password', (req, res, next) => adminController.changePassword(req, res, next));
router.post('/users/:id/assign-routine', (req, res, next) => adminController.assignRoutine(req, res, next));
router.post('/users/:id/feedback', (req, res, next) => adminController.sendFeedback(req, res, next));
router.delete('/users/:id', (req, res, next) => adminController.deleteUser(req, res, next));

export default router;
