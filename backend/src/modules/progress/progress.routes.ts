import { Router } from 'express';
import { progressController } from './progress.controller';
import { authenticate } from '../../middlewares/auth.middleware';
import { uploadProgressPhoto } from '../../middlewares/upload.middleware';

const router = Router();

router.use(authenticate);

// Weekly Weight
router.post('/weight', (req, res, next) => progressController.logWeight(req, res, next));
router.get('/weight', (req, res, next) => progressController.getWeightHistory(req, res, next));

// Measurements
router.post('/measurements', (req, res, next) => progressController.logMeasurements(req, res, next));
router.get('/measurements', (req, res, next) => progressController.getMeasurements(req, res, next));

// Photos
router.post('/photos', uploadProgressPhoto, (req, res, next) => progressController.uploadPhoto(req, res, next));
router.get('/photos', (req, res, next) => progressController.listPhotos(req, res, next));
router.get('/photos/:id/view', (req, res, next) => progressController.viewPhoto(req, res, next));
router.delete('/photos/:id', (req, res, next) => progressController.deletePhoto(req, res, next));

export default router;
