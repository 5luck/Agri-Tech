import { Router } from 'express';
import { createOrder, listOrders, getOrderById, cancelOrder, updateOrderStatus } from './orders.controller.js';
import { authenticate } from '../../middleware/authenticate.js';

const router = Router();

router.use(authenticate);

router.post('/', createOrder);
router.get('/', listOrders);
router.get('/:id', getOrderById);
router.patch('/:id/cancel', cancelOrder);
router.patch('/:id/status', updateOrderStatus);

export default router;
