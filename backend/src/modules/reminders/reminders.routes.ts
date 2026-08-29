import { Router } from 'express';
import { remindersController } from './reminders.controller';
import { authenticate } from '../../middlewares/auth.middleware';

const router = Router();

router.use(authenticate);

router.get('/', (req, res, next) => remindersController.list(req, res, next));
router.post('/', (req, res, next) => remindersController.create(req, res, next));
router.put('/:id', (req, res, next) => remindersController.update(req, res, next));
router.delete('/:id', (req, res, next) => remindersController.delete(req, res, next));

export default router;
