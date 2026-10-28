import { Router } from 'express';
import {
  getOverview,
  listUsers,
  updateUserStatus,
  listPendingExperts,
  updateExpertVerification,
  listPendingProducts,
  updateProductApproval,
  listReportedPosts,
  moderateReportedPost,
  listAuditLogs
} from './admin.controller.js';
import { authenticate } from '../../middleware/authenticate.js';
import { authorize } from '../../middleware/authorize.js';

const router = Router();

// Strictly protect all administrative routes
router.use(authenticate, authorize('admin'));

router.get('/overview', getOverview);
router.get('/users', listUsers);
router.patch('/users/:id/status', updateUserStatus);
router.get('/experts/pending', listPendingExperts);
router.patch('/experts/:id/verification', updateExpertVerification);
router.get('/products/pending', listPendingProducts);
router.patch('/products/:id/approval', updateProductApproval);
router.get('/reports', listReportedPosts);
router.patch('/reports/:postId/action', moderateReportedPost);
router.get('/audit-logs', listAuditLogs);

export default router;
