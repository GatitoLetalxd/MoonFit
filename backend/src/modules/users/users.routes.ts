import { Router } from 'express';
import { usersController } from './users.controller';
import { authenticate } from '../../middlewares/auth.middleware';
import { uploadAvatarPhoto } from '../../middlewares/upload.middleware';

const router = Router();

// Public / Token-authenticated view route
router.get('/:id/avatar', (req, res, next) => usersController.viewAvatar(req, res, next));

router.use(authenticate);

router.get('/profile', (req, res, next) => usersController.getProfile(req, res, next));
router.put('/profile', (req, res, next) => usersController.updateProfile(req, res, next));
router.post('/avatar', uploadAvatarPhoto, (req, res, next) => usersController.uploadAvatar(req, res, next));
router.post('/onboarding', (req, res, next) => usersController.completeOnboarding(req, res, next));
router.delete('/me', (req, res, next) => usersController.deleteMyAccount(req, res, next));

export default router;
