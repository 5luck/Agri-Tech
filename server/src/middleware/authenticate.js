import { verifyToken } from '../utils/tokenUtils.js';
import { User } from '../models/User.js';
import { sendError } from '../utils/apiResponse.js';

export const authenticate = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return sendError(res, 'Authentication token is required', 401);
    }

    const token = authHeader.split(' ')[1];
    const decoded = verifyToken(token);
    if (!decoded || !decoded.userId) {
      return sendError(res, 'Invalid or expired authentication token', 401);
    }

    const user = await User.findById(decoded.userId);
    if (!user) {
      return sendError(res, 'User not found', 401);
    }

    if (user.status === 'suspended') {
      return sendError(res, 'Account has been suspended. Please contact support.', 403);
    }

    req.user = user;
    next();
  } catch (error) {
    return sendError(res, 'Authentication failed', 401, [error.message]);
  }
};
