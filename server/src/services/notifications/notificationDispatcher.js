import { Notification } from '../../models/Notification.js';
import { logger } from '../../utils/logger.js';

export const dispatchNotification = async ({
  userId,
  type = 'system',
  title,
  message,
  resourceType = '',
  resourceId = null
}) => {
  try {
    const notification = await Notification.create({
      userId,
      type,
      title,
      message,
      resourceType,
      resourceId
    });
    return notification;
  } catch (err) {
    logger.warn(`Failed to dispatch notification: ${err.message}`);
    return null;
  }
};
