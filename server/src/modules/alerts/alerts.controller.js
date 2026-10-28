import { Alert } from '../../models/Alert.js';
import { sendSuccess, sendError } from '../../utils/apiResponse.js';

export const listAlerts = async (req, res, next) => {
  try {
    const filter = req.user.role === 'admin' ? {} : { ownerId: req.user._id };
    if (req.query.type) filter.type = req.query.type;
    if (req.query.severity) filter.severity = req.query.severity;
    if (req.query.status) {
      filter.status = req.query.status;
    } else {
      filter.status = { $ne: 'dismissed' };
    }

    const alerts = await Alert.find(filter)
      .populate('farmId', 'name')
      .populate('cropId', 'name')
      .sort({ createdAt: -1 });

    return sendSuccess(res, alerts, 'Alerts retrieved');
  } catch (err) {
    next(err);
  }
};

export const getAlertById = async (req, res, next) => {
  try {
    const alert = await Alert.findById(req.params.id)
      .populate('farmId', 'name location')
      .populate('cropId', 'name');

    if (!alert) return sendError(res, 'Alert not found', 404);

    if (req.user.role !== 'admin' && alert.ownerId.toString() !== req.user._id.toString()) {
      return sendError(res, 'Access denied', 403);
    }

    return sendSuccess(res, alert, 'Alert retrieved');
  } catch (err) {
    next(err);
  }
};

export const markAlertAsRead = async (req, res, next) => {
  try {
    const alert = await Alert.findById(req.params.id);
    if (!alert) return sendError(res, 'Alert not found', 404);

    if (req.user.role !== 'admin' && alert.ownerId.toString() !== req.user._id.toString()) {
      return sendError(res, 'Access denied', 403);
    }

    alert.status = 'read';
    await alert.save();
    return sendSuccess(res, alert, 'Alert marked as read');
  } catch (err) {
    next(err);
  }
};

export const dismissAlert = async (req, res, next) => {
  try {
    const alert = await Alert.findById(req.params.id);
    if (!alert) return sendError(res, 'Alert not found', 404);

    if (req.user.role !== 'admin' && alert.ownerId.toString() !== req.user._id.toString()) {
      return sendError(res, 'Access denied', 403);
    }

    alert.status = 'dismissed';
    await alert.save();
    return sendSuccess(res, alert, 'Alert dismissed');
  } catch (err) {
    next(err);
  }
};

export const createAlert = async (req, res, next) => {
  try {
    const { farmId, cropId, type, title, description, severity, source, recommendedAction } = req.body;

    if (!title || !description) {
      return sendError(res, 'Title and description are required', 400);
    }

    const alert = await Alert.create({
      ownerId: req.user._id,
      farmId: farmId || null,
      cropId: cropId || null,
      type: type || 'system',
      title: title.trim(),
      description: description.trim(),
      severity: severity || 'moderate',
      source: source || 'Agri-Tech Advisory',
      recommendedAction: recommendedAction || '',
      status: 'unread'
    });

    return sendSuccess(res, alert, 'Alert created successfully', 201);
  } catch (err) {
    next(err);
  }
};
