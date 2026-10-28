import { Router } from 'express';
import { listSoilRecordsByFarm, createSoilRecord, getSoilRecordById, deleteSoilRecord } from './soil.controller.js';
import { authenticate } from '../../middleware/authenticate.js';

const router = Router();

router.use(authenticate);

router.get('/farm/:farmId', listSoilRecordsByFarm);
router.post('/farm/:farmId', createSoilRecord);
router.get('/:id', getSoilRecordById);
router.delete('/:id', deleteSoilRecord);

export default router;
