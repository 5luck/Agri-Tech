import { User } from '../../models/User.js';
import { Farm } from '../../models/Farm.js';
import { Product } from '../../models/Product.js';
import { Order } from '../../models/Order.js';
import { CommunityPost } from '../../models/CommunityPost.js';
import { AuditLog } from '../../models/AuditLog.js';
import { sendSuccess, sendError } from '../../utils/apiResponse.js';
import { recordAuditLog } from '../../services/audit/auditService.js';

export const getOverview = async (req, res, next) => {
  try {
    const [
      totalUsers,
      totalFarmers,
      totalFarms,
      pendingExperts,
      pendingProducts,
      totalOrders,
      reportedPosts,
      recentLogs
    ] = await Promise.all([
      User.countDocuments(),
      User.countDocuments({ role: 'farmer', status: 'active' }),
      Farm.countDocuments({ status: 'active' }),
      User.countDocuments({ role: 'expert', 'expertProfile.verificationStatus': 'pending' }),
      Product.countDocuments({ approvalStatus: 'pending' }),
      Order.countDocuments(),
      CommunityPost.countDocuments({ 'reports.0': { $exists: true }, status: 'published' }),
      AuditLog.find().sort({ createdAt: -1 }).limit(10).populate('actorId', 'name email role')
    ]);

    return sendSuccess(res, {
      metrics: {
        totalUsers,
        totalFarmers,
        totalFarms,
        pendingExperts,
        pendingProducts,
        totalOrders,
        reportedPosts
      },
      recentLogs
    }, 'Admin metrics retrieved');
  } catch (err) {
    next(err);
  }
};

export const listUsers = async (req, res, next) => {
  try {
    const { role, status, search } = req.query;
    const filter = {};

    if (role) filter.role = role;
    if (status) filter.status = status;
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ];
    }

    const users = await User.find(filter).sort({ createdAt: -1 });
    return sendSuccess(res, users, 'Users retrieved');
  } catch (err) {
    next(err);
  }
};

export const updateUserStatus = async (req, res, next) => {
  try {
    const { status } = req.body;
    if (!['active', 'suspended', 'pending'].includes(status)) {
      return sendError(res, 'Invalid status value', 400);
    }

    const user = await User.findById(req.params.id);
    if (!user) return sendError(res, 'User not found', 404);

    // Prevent suspending the root admin account itself
    if (user.role === 'admin' && user._id.toString() === req.user._id.toString()) {
      return sendError(res, 'Administrators cannot suspend their own active session', 400);
    }

    const oldStatus = user.status;
    user.status = status;
    await user.save();

    await recordAuditLog({
      actorId: req.user._id,
      action: 'ADMIN_UPDATE_USER_STATUS',
      resourceType: 'User',
      resourceId: user._id,
      metadata: { oldStatus, newStatus: status }
    });

    return sendSuccess(res, user, `User status updated to ${status}`);
  } catch (err) {
    next(err);
  }
};

export const listPendingExperts = async (req, res, next) => {
  try {
    const experts = await User.find({
      role: 'expert',
      'expertProfile.verificationStatus': 'pending'
    }).sort({ createdAt: -1 });

    return sendSuccess(res, experts, 'Pending expert verifications retrieved');
  } catch (err) {
    next(err);
  }
};

export const updateExpertVerification = async (req, res, next) => {
  try {
    const { status } = req.body; // 'verified' | 'rejected'
    if (!['verified', 'rejected'].includes(status)) {
      return sendError(res, 'Status must be "verified" or "rejected"', 400);
    }

    const user = await User.findOne({ _id: req.params.id, role: 'expert' });
    if (!user) return sendError(res, 'Expert not found', 404);

    user.expertProfile.verificationStatus = status;
    await user.save();

    await recordAuditLog({
      actorId: req.user._id,
      action: 'ADMIN_VERIFY_EXPERT',
      resourceType: 'User',
      resourceId: user._id,
      metadata: { verificationStatus: status }
    });

    return sendSuccess(res, user, `Expert verification updated to ${status}`);
  } catch (err) {
    next(err);
  }
};

export const listPendingProducts = async (req, res, next) => {
  try {
    const products = await Product.find({ approvalStatus: 'pending' })
      .populate('sellerId', 'name email')
      .sort({ createdAt: -1 });

    return sendSuccess(res, products, 'Pending products retrieved');
  } catch (err) {
    next(err);
  }
};

export const updateProductApproval = async (req, res, next) => {
  try {
    const { approvalStatus } = req.body; // 'approved' | 'rejected'
    if (!['approved', 'rejected'].includes(approvalStatus)) {
      return sendError(res, 'Approval status must be "approved" or "rejected"', 400);
    }

    const product = await Product.findById(req.params.id);
    if (!product) return sendError(res, 'Product not found', 404);

    product.approvalStatus = approvalStatus;
    await product.save();

    await recordAuditLog({
      actorId: req.user._id,
      action: 'ADMIN_APPROVE_PRODUCT',
      resourceType: 'Product',
      resourceId: product._id,
      metadata: { approvalStatus }
    });

    return sendSuccess(res, product, `Product approval set to ${approvalStatus}`);
  } catch (err) {
    next(err);
  }
};

export const listReportedPosts = async (req, res, next) => {
  try {
    const posts = await CommunityPost.find({
      'reports.0': { $exists: true }
    })
      .populate('authorId', 'name email')
      .populate('reports.reporterId', 'name email')
      .sort({ updatedAt: -1 });

    return sendSuccess(res, posts, 'Reported posts retrieved');
  } catch (err) {
    next(err);
  }
};

export const moderateReportedPost = async (req, res, next) => {
  try {
    const { action } = req.body; // 'dismiss' | 'remove'
    const post = await CommunityPost.findById(req.params.postId);
    if (!post) return sendError(res, 'Post not found', 404);

    if (action === 'remove') {
      post.status = 'removed';
    } else if (action === 'dismiss') {
      post.reports = [];
    } else {
      return sendError(res, 'Action must be "dismiss" or "remove"', 400);
    }

    await post.save();

    await recordAuditLog({
      actorId: req.user._id,
      action: 'ADMIN_MODERATE_POST',
      resourceType: 'CommunityPost',
      resourceId: post._id,
      metadata: { moderationAction: action }
    });

    return sendSuccess(res, post, `Post moderation action completed: ${action}`);
  } catch (err) {
    next(err);
  }
};

export const listAuditLogs = async (req, res, next) => {
  try {
    const logs = await AuditLog.find()
      .populate('actorId', 'name email role')
      .sort({ createdAt: -1 })
      .limit(100);

    return sendSuccess(res, logs, 'Audit logs retrieved');
  } catch (err) {
    next(err);
  }
};
