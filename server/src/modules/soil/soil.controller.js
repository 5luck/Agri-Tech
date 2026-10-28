import { SoilRecord } from '../../models/SoilRecord.js';
import { Farm } from '../../models/Farm.js';
import { analyzeSoilMeasurements } from '../../services/analytics/soilAnalytics.js';
import { sendSuccess, sendError } from '../../utils/apiResponse.js';

export const listSoilRecordsByFarm = async (req, res, next) => {
  try {
    const farm = await Farm.findById(req.params.farmId);
    if (!farm) return sendError(res, 'Farm not found', 404);

    if (req.user.role !== 'admin' && farm.ownerId.toString() !== req.user._id.toString()) {
      return sendError(res, 'Access denied', 403);
    }

    const records = await SoilRecord.find({ farmId: farm._id })
      .populate('cropId', 'name growthStage')
      .sort({ measuredAt: -1 });

    return sendSuccess(res, records, 'Soil records retrieved');
  } catch (err) {
    next(err);
  }
};

export const createSoilRecord = async (req, res, next) => {
  try {
    const { farmId } = req.params;
    const { cropId, measurements, source, notes, measuredAt } = req.body;

    const farm = await Farm.findById(farmId);
    if (!farm) return sendError(res, 'Farm not found', 404);

    if (req.user.role !== 'admin' && farm.ownerId.toString() !== req.user._id.toString()) {
      return sendError(res, 'Access denied', 403);
    }

    if (!measurements) {
      return sendError(res, 'Soil measurements are required', 400);
    }

    const { ph, nitrogen, phosphorus, potassium, moisture } = measurements;
    if (ph === undefined || nitrogen === undefined || phosphorus === undefined || potassium === undefined || moisture === undefined) {
      return sendError(res, 'pH, Nitrogen, Phosphorus, Potassium, and Moisture are required', 400);
    }

    if (ph < 0 || ph > 14) return sendError(res, 'pH must be between 0 and 14', 400);
    if (moisture < 0 || moisture > 100) return sendError(res, 'Moisture must be between 0% and 100%', 400);

    // Run transparent agronomic recommendation engine
    const recommendations = analyzeSoilMeasurements(measurements);

    const record = await SoilRecord.create({
      farmId: farm._id,
      cropId: cropId || null,
      ownerId: req.user._id,
      measurements: {
        ph: Number(ph),
        nitrogen: Number(nitrogen),
        phosphorus: Number(phosphorus),
        potassium: Number(potassium),
        moisture: Number(moisture),
        temperature: measurements.temperature ? Number(measurements.temperature) : undefined,
        electricalConductivity: measurements.electricalConductivity ? Number(measurements.electricalConductivity) : undefined,
        organicMatter: measurements.organicMatter ? Number(measurements.organicMatter) : undefined
      },
      source: source || 'manual',
      recommendations,
      notes: notes || '',
      measuredAt: measuredAt || new Date()
    });

    return sendSuccess(res, record, 'Soil record logged successfully with recommendations', 201);
  } catch (err) {
    next(err);
  }
};

export const getSoilRecordById = async (req, res, next) => {
  try {
    const record = await SoilRecord.findById(req.params.id)
      .populate('farmId', 'name location')
      .populate('cropId', 'name growthStage');

    if (!record) return sendError(res, 'Soil record not found', 404);

    if (req.user.role !== 'admin' && record.ownerId.toString() !== req.user._id.toString()) {
      return sendError(res, 'Access denied', 403);
    }

    return sendSuccess(res, record, 'Soil record retrieved');
  } catch (err) {
    next(err);
  }
};

export const deleteSoilRecord = async (req, res, next) => {
  try {
    const record = await SoilRecord.findById(req.params.id);
    if (!record) return sendError(res, 'Soil record not found', 404);

    if (req.user.role !== 'admin' && record.ownerId.toString() !== req.user._id.toString()) {
      return sendError(res, 'Access denied', 403);
    }

    await SoilRecord.findByIdAndDelete(req.params.id);
    return sendSuccess(res, {}, 'Soil record deleted');
  } catch (err) {
    next(err);
  }
};
