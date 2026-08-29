import { Router } from 'express';
import { routinesController } from './routines.controller';
import { authenticate } from '../../middlewares/auth.middleware';

const router = Router();

router.use(authenticate);

router.get('/', (req, res, next) => routinesController.list(req, res, next));
router.get('/:id', (req, res, next) => routinesController.getById(req, res, next));
router.post('/', (req, res, next) => routinesController.create(req, res, next));
router.put('/:id', (req, res, next) => routinesController.update(req, res, next));
router.delete('/:id', (req, res, next) => routinesController.delete(req, res, next));

export default router;
