import { Router } from 'express';
import { workoutsController } from './workouts.controller';
import { authenticate } from '../../middlewares/auth.middleware';

const router = Router();

router.use(authenticate);

router.post('/', (req, res, next) => workoutsController.log(req, res, next));
router.get('/', (req, res, next) => workoutsController.getHistory(req, res, next));
router.get('/history', (req, res, next) => workoutsController.getHistory(req, res, next));

export default router;
