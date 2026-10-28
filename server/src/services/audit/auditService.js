import { AuditLog } from '../../models/AuditLog.js';
import { logger } from '../../utils/logger.js';

export const recordAuditLog = async ({
  actorId = null,
  action,
  resourceType,
  resourceId = null,
  outcome = 'success',
  metadata = {}
}) => {
  try {
    // Sanitize metadata to never store passwords or tokens
    const cleanMeta = { ...metadata };
    delete cleanMeta.password;
    delete cleanMeta.passwordHash;
    delete cleanMeta.token;
    delete cleanMeta.authorization;

    await AuditLog.create({
      actorId,
      action,
      resourceType,
      resourceId,
      outcome,
      metadata: cleanMeta
    });
  } catch (err) {
    logger.warn(`Failed to write audit log: ${err.message}`);
  }
};
