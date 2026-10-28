import { Router } from 'express';
import { listExperts, createConsultation, listConsultations, getConsultationById, updateConsultationStatus, addMessageToConsultation } from './consultations.controller.js';
import { authenticate } from '../../middleware/authenticate.js';

const router = Router();

// Public / Authenticated expert directory
router.get('/experts', listExperts);

router.use(authenticate);

router.get('/', listConsultations);
router.post('/', createConsultation);
router.get('/:id', getConsultationById);
router.patch('/:id/status', updateConsultationStatus);
router.post('/:id/messages', addMessageToConsultation);

export default router;
