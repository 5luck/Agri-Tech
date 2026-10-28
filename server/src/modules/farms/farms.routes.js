import { Router } from 'express';
import { listFarms, createFarm, getFarmById, updateFarm, archiveFarm, getFarmSummary } from './farms.controller.js';
import { authenticate } from '../../middleware/authenticate.js';

const router = Router();

router.use(authenticate);

router.get('/', listFarms);
router.post('/', createFarm);
router.get('/:id', getFarmById);
router.patch('/:id', updateFarm);
router.delete('/:id', archiveFarm);
router.get('/:farmId/summary', getFarmSummary);

export default router;
