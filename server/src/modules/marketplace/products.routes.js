import { Router } from 'express';
import { listProducts, getProductById, createProduct, updateProduct, deleteProduct, getCategories } from './products.controller.js';
import { authenticate } from '../../middleware/authenticate.js';

const router = Router();

// Publicly viewable catalog
router.get('/', listProducts);
router.get('/categories', getCategories);
router.get('/:id', getProductById);

// Protected mutations
router.post('/', authenticate, createProduct);
router.patch('/:id', authenticate, updateProduct);
router.delete('/:id', authenticate, deleteProduct);

export default router;
