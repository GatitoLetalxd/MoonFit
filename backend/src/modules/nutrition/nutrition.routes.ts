import { Router } from 'express';
import { nutritionController } from './nutrition.controller';
import { authenticate } from '../../middlewares/auth.middleware';
import { uploadMealPhoto } from '../../middlewares/upload.middleware';

const router = Router();

router.use(authenticate);

// References
router.get('/references', (req, res, next) => nutritionController.getReferences(req, res, next));

// Meals
router.post('/meals', uploadMealPhoto, (req, res, next) => nutritionController.logMeal(req, res, next));
router.get('/meals', (req, res, next) => nutritionController.listMeals(req, res, next));
router.get('/meals/photos/:id/view', (req, res, next) => nutritionController.viewMealPhoto(req, res, next));
router.delete('/meals/:id', (req, res, next) => nutritionController.deleteMeal(req, res, next));

// Water
router.post('/water', (req, res, next) => nutritionController.logWater(req, res, next));
router.get('/water', (req, res, next) => nutritionController.getWaterHistory(req, res, next));

export default router;
