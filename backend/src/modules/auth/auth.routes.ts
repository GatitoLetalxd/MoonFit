import { Router } from 'express';
import { authController } from './auth.controller';
import { validate } from '../../middlewares/validate.middleware';
import { registerSchema, loginSchema, refreshSchema } from './auth.validation';
import { authRateLimiter } from '../../middlewares/rate-limiter';
import { authenticate } from '../../middlewares/auth.middleware';

const router = Router();

router.post('/register', authRateLimiter, validate({ body: registerSchema }), (req, res, next) =>
  authController.register(req, res, next)
);

router.post('/login', authRateLimiter, validate({ body: loginSchema }), (req, res, next) =>
  authController.login(req, res, next)
);

router.post('/refresh', validate({ body: refreshSchema }), (req, res, next) =>
  authController.refresh(req, res, next)
);

router.post('/logout', authenticate, (req, res, next) =>
  authController.logout(req, res, next)
);

router.get('/me', authenticate, (req, res, next) =>
  authController.getMe(req, res, next)
);

export default router;
