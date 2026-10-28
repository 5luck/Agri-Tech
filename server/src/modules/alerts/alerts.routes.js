import { Router } from 'express';
import { listAlerts, getAlertById, markAlertAsRead, dismissAlert, createAlert } from './alerts.controller.js';
import { authenticate } from '../../middleware/authenticate.js';

const router = Router();

router.use(authenticate);

router.get('/', listAlerts);
router.post('/', createAlert);
router.get('/:id', getAlertById);
router.patch('/:id/read', markAlertAsRead);
router.patch('/:id/dismiss', dismissAlert);

export default router;
