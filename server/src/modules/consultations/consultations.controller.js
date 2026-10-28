import { Consultation } from '../../models/Consultation.js';
import { User } from '../../models/User.js';
import { dispatchNotification } from '../../services/notifications/notificationDispatcher.js';
import { sendSuccess, sendError } from '../../utils/apiResponse.js';

export const listExperts = async (req, res, next) => {
  try {
    const experts = await User.find({
      role: 'expert',
      status: 'active',
      'expertProfile.verificationStatus': 'verified'
    }).select('name email phone expertProfile profileImage');

    return sendSuccess(res, experts, 'Verified experts retrieved');
  } catch (err) {
    next(err);
  }
};

export const createConsultation = async (req, res, next) => {
  try {
    const { expertId, farmId, cropId, subject, description, preferredDate } = req.body;

    if (!expertId || !subject || !description) {
      return sendError(res, 'Expert ID, subject, and description are required', 400);
    }

    const expert = await User.findOne({ _id: expertId, role: 'expert' });
    if (!expert) {
      return sendError(res, 'Selected agricultural expert not found', 404);
    }

    const consultation = await Consultation.create({
      farmerId: req.user._id,
      expertId,
      farmId: farmId || null,
      cropId: cropId || null,
      subject: subject.trim(),
      description: description.trim(),
      preferredDate: preferredDate || null,
      status: 'pending',
      messages: [
        {
          senderId: req.user._id,
          senderRole: 'farmer',
          message: description.trim(),
          sentAt: new Date()
        }
      ]
    });

    // Notify expert
    await dispatchNotification({
      userId: expertId,
      type: 'consultation',
      title: 'New Consultation Request',
      message: `${req.user.name} submitted a consultation inquiry: "${subject.slice(0, 40)}..."`,
      resourceType: 'Consultation',
      resourceId: consultation._id
    });

    return sendSuccess(res, consultation, 'Consultation request submitted successfully', 201);
  } catch (err) {
    next(err);
  }
};

export const listConsultations = async (req, res, next) => {
  try {
    let filter = {};
    if (req.user.role === 'farmer') {
      filter = { farmerId: req.user._id };
    } else if (req.user.role === 'expert') {
      filter = { expertId: req.user._id };
    } // admin sees all

    const consultations = await Consultation.find(filter)
      .populate('farmerId', 'name email phone')
      .populate('expertId', 'name email expertProfile')
      .populate('farmId', 'name location')
      .populate('cropId', 'name growthStage')
      .sort({ updatedAt: -1 });

    return sendSuccess(res, consultations, 'Consultations retrieved');
  } catch (err) {
    next(err);
  }
};

export const getConsultationById = async (req, res, next) => {
  try {
    const consultation = await Consultation.findById(req.params.id)
      .populate('farmerId', 'name email phone')
      .populate('expertId', 'name email expertProfile')
      .populate('farmId', 'name location soilType')
      .populate('cropId', 'name growthStage')
      .populate('messages.senderId', 'name role');

    if (!consultation) return sendError(res, 'Consultation not found', 404);

    const isFarmer = consultation.farmerId._id.toString() === req.user._id.toString();
    const isExpert = consultation.expertId._id.toString() === req.user._id.toString();
    const isAdmin = req.user.role === 'admin';

    if (!isFarmer && !isExpert && !isAdmin) {
      return sendError(res, 'Access denied to this consultation', 403);
    }

    return sendSuccess(res, consultation, 'Consultation retrieved');
  } catch (err) {
    next(err);
  }
};

export const updateConsultationStatus = async (req, res, next) => {
  try {
    const { status, expertResponse } = req.body;
    const consultation = await Consultation.findById(req.params.id);
    if (!consultation) return sendError(res, 'Consultation not found', 404);

    const isExpert = consultation.expertId.toString() === req.user._id.toString();
    const isFarmer = consultation.farmerId.toString() === req.user._id.toString();
    const isAdmin = req.user.role === 'admin';

    if (!isExpert && !isAdmin && !isFarmer) {
      return sendError(res, 'Access denied', 403);
    }

    // Only expert or admin can accept/reject/complete
    if (['accepted', 'rejected', 'in_progress', 'completed'].includes(status) && !isExpert && !isAdmin) {
      return sendError(res, 'Only the assigned expert or an admin can update consultation progress', 403);
    }

    if (status) consultation.status = status;
    if (expertResponse) consultation.expertResponse = expertResponse;

    await consultation.save();

    // Notify farmer of status change
    await dispatchNotification({
      userId: consultation.farmerId,
      type: 'consultation',
      title: 'Consultation Status Updated',
      message: `Your consultation "${consultation.subject}" has been marked as ${status}.`,
      resourceType: 'Consultation',
      resourceId: consultation._id
    });

    return sendSuccess(res, consultation, 'Consultation status updated');
  } catch (err) {
    next(err);
  }
};

export const addMessageToConsultation = async (req, res, next) => {
  try {
    const { message } = req.body;
    if (!message || !message.trim()) {
      return sendError(res, 'Message text is required', 400);
    }

    const consultation = await Consultation.findById(req.params.id);
    if (!consultation) return sendError(res, 'Consultation not found', 404);

    const isFarmer = consultation.farmerId.toString() === req.user._id.toString();
    const isExpert = consultation.expertId.toString() === req.user._id.toString();
    const isAdmin = req.user.role === 'admin';

    if (!isFarmer && !isExpert && !isAdmin) {
      return sendError(res, 'Access denied', 403);
    }

    const role = isExpert ? 'expert' : isFarmer ? 'farmer' : 'admin';

    consultation.messages.push({
      senderId: req.user._id,
      senderRole: role,
      message: message.trim(),
      sentAt: new Date()
    });

    if (isExpert && consultation.status === 'pending') {
      consultation.status = 'in_progress';
    }

    await consultation.save();

    // Notify the other party
    const targetUserId = isFarmer ? consultation.expertId : consultation.farmerId;
    await dispatchNotification({
      userId: targetUserId,
      type: 'consultation',
      title: 'New Consultation Message',
      message: `${req.user.name}: "${message.slice(0, 50)}..."`,
      resourceType: 'Consultation',
      resourceId: consultation._id
    });

    return sendSuccess(res, consultation, 'Message sent successfully');
  } catch (err) {
    next(err);
  }
};
