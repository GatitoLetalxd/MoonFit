import { Router } from 'express';
import { goalsController } from './goals.controller';
import { authenticate } from '../../middlewares/auth.middleware';

const router = Router();

router.use(authenticate);

router.post('/', (req, res, next) => goalsController.create(req, res, next));
router.get('/', (req, res, next) => goalsController.list(req, res, next));
router.put('/:id', (req, res, next) => goalsController.update(req, res, next));
router.delete('/:id', (req, res, next) => goalsController.delete(req, res, next));

export default router;
