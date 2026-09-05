import { Router } from 'express';
import { notificationsController } from './notifications.controller';
import { authenticate } from '../../middlewares/auth.middleware';

const router = Router();

// Todas las rutas requieren autenticación
router.use(authenticate);

router.post('/push-token', (req, res) => notificationsController.registerPushToken(req, res));
router.patch('/preferences', (req, res) => notificationsController.updatePreferences(req, res));

export default router;
