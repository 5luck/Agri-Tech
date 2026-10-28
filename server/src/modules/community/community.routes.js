import { Router } from 'express';
import { listPosts, createPost, getPostById, updatePost, deletePost, addComment, reportPost } from './community.controller.js';
import { authenticate } from '../../middleware/authenticate.js';

const router = Router();

// Publicly viewable forum
router.get('/', listPosts);
router.get('/:id', getPostById);

// Authenticated interactions
router.post('/', authenticate, createPost);
router.patch('/:id', authenticate, updatePost);
router.delete('/:id', authenticate, deletePost);
router.post('/:id/comments', authenticate, addComment);
router.post('/:id/report', authenticate, reportPost);

export default router;
