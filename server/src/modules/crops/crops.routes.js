import { Router } from 'express';
import { listCrops, createCrop, getCropById, updateCrop, archiveCrop, addActivity, toggleActivity, getCropsByFarm } from './crops.controller.js';
import { authenticate } from '../../middleware/authenticate.js';

const router = Router();

router.use(authenticate);

router.get('/', listCrops);
router.post('/', createCrop);
router.get('/:id', getCropById);
router.patch('/:id', updateCrop);
router.delete('/:id', archiveCrop);
router.post('/:id/activities', addActivity);
router.patch('/:id/activities/:activityId', toggleActivity);
router.get('/farm/:farmId', getCropsByFarm);

export default router;
