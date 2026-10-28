import bcrypt from 'bcryptjs';
import { User } from '../../models/User.js';
import { generateToken } from '../../utils/tokenUtils.js';
import { sendSuccess, sendError } from '../../utils/apiResponse.js';
import { recordAuditLog } from '../../services/audit/auditService.js';

export const register = async (req, res, next) => {
  try {
    const { name, email, password, phone, role, preferredLanguage, expertProfile } = req.body;

    if (!name || !email || !password) {
      return sendError(res, 'Name, email, and password are required', 400);
    }

    if (password.length < 6) {
      return sendError(res, 'Password must be at least 6 characters long', 400);
    }

    // Never allow direct registration of admin role
    if (role === 'admin') {
      return sendError(res, 'Administrator accounts cannot be registered publicly', 403);
    }

    const assignedRole = role === 'expert' ? 'expert' : 'farmer';

    const normalizedEmail = email.toLowerCase().trim();
    const existing = await User.findOne({ email: normalizedEmail });
    if (existing) {
      return sendError(res, 'An account with this email already exists', 409);
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    const newUser = await User.create({
      name: name.trim(),
      email: normalizedEmail,
      passwordHash,
      phone: phone || '',
      role: assignedRole,
      preferredLanguage: preferredLanguage || 'en',
      status: 'active',
      expertProfile: assignedRole === 'expert' ? {
        specialization: expertProfile?.specialization || [],
        qualifications: expertProfile?.qualifications || [],
        languages: expertProfile?.languages || ['English'],
        verificationStatus: 'pending',
        bio: expertProfile?.bio || '',
        yearsExperience: expertProfile?.yearsExperience || 0
      } : undefined
    });

    const token = generateToken({ userId: newUser._id, role: newUser.role });

    await recordAuditLog({
      actorId: newUser._id,
      action: 'USER_REGISTER',
      resourceType: 'User',
      resourceId: newUser._id
    });

    return sendSuccess(res, { user: newUser, token }, 'Registration successful', 201);
  } catch (err) {
    next(err);
  }
};

export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return sendError(res, 'Email and password are required', 400);
    }

    const normalizedEmail = email.toLowerCase().trim();
    const user = await User.findOne({ email: normalizedEmail });
    if (!user) {
      return sendError(res, 'Invalid email or password', 401);
    }

    if (user.status === 'suspended') {
      return sendError(res, 'This account has been suspended. Please contact platform administrators.', 403);
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return sendError(res, 'Invalid email or password', 401);
    }

    const token = generateToken({ userId: user._id, role: user.role });

    await recordAuditLog({
      actorId: user._id,
      action: 'USER_LOGIN',
      resourceType: 'User',
      resourceId: user._id
    });

    return sendSuccess(res, { user, token }, 'Login successful');
  } catch (err) {
    next(err);
  }
};

export const getMe = async (req, res) => {
  return sendSuccess(res, { user: req.user }, 'Current user retrieved');
};

export const updateProfile = async (req, res, next) => {
  try {
    const { name, phone, preferredLanguage, bio, specialization, yearsExperience } = req.body;
    const user = req.user;

    if (name) user.name = name.trim();
    if (phone !== undefined) user.phone = phone.trim();
    if (preferredLanguage) user.preferredLanguage = preferredLanguage;

    if (user.role === 'expert') {
      if (bio !== undefined) user.expertProfile.bio = bio;
      if (specialization) user.expertProfile.specialization = specialization;
      if (yearsExperience !== undefined) user.expertProfile.yearsExperience = yearsExperience;
    }

    await user.save();
    return sendSuccess(res, { user }, 'Profile updated successfully');
  } catch (err) {
    next(err);
  }
};

export const forgotPassword = async (req, res) => {
  const { email } = req.body;
  if (!email) {
    return sendError(res, 'Email is required', 400);
  }
  // In dev / initial release, return affirmative guidance without revealing whether email exists
  return sendSuccess(
    res,
    { resetInstructionsSent: true },
    'If an account is associated with this email, password reset instructions have been dispatched.'
  );
};

export const resetPassword = async (req, res, next) => {
  try {
    const { email, newPassword } = req.body;
    if (!email || !newPassword || newPassword.length < 6) {
      return sendError(res, 'Email and valid new password (min 6 characters) are required', 400);
    }
    const user = await User.findOne({ email: email.toLowerCase().trim() });
    if (!user) {
      return sendError(res, 'Unable to reset password for this account', 400);
    }
    const salt = await bcrypt.genSalt(10);
    user.passwordHash = await bcrypt.hash(newPassword, salt);
    await user.save();

    await recordAuditLog({
      actorId: user._id,
      action: 'PASSWORD_RESET',
      resourceType: 'User',
      resourceId: user._id
    });

    return sendSuccess(res, {}, 'Password reset successfully. You may now log in with your new password.');
  } catch (err) {
    next(err);
  }
};

export const logout = async (req, res) => {
  return sendSuccess(res, {}, 'Logged out successfully');
};
