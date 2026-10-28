import { Crop } from '../../models/Crop.js';
import { Farm } from '../../models/Farm.js';
import { sendSuccess, sendError } from '../../utils/apiResponse.js';

export const listCrops = async (req, res, next) => {
  try {
    const filter = req.user.role === 'admin' ? {} : { ownerId: req.user._id };
    if (req.query.farmId) filter.farmId = req.query.farmId;
    if (req.query.status) {
      filter.status = req.query.status;
    } else {
      filter.status = { $ne: 'archived' };
    }

    const crops = await Crop.find(filter).populate('farmId', 'name location').sort({ createdAt: -1 });
    return sendSuccess(res, crops, 'Crops retrieved successfully');
  } catch (err) {
    next(err);
  }
};

export const createCrop = async (req, res, next) => {
  try {
    const { farmId, name, variety, plantingDate, expectedHarvestDate, growthStage, cultivatedArea, irrigationMethod, notes } = req.body;

    if (!farmId || !name || !plantingDate || !cultivatedArea) {
      return sendError(res, 'Farm ID, name, planting date, and cultivated area are required', 400);
    }

    // Verify farm ownership
    const farm = await Farm.findById(farmId);
    if (!farm) {
      return sendError(res, 'Specified farm does not exist', 404);
    }

    if (req.user.role !== 'admin' && farm.ownerId.toString() !== req.user._id.toString()) {
      return sendError(res, 'Access denied. You do not own this farm.', 403);
    }

    const crop = await Crop.create({
      farmId,
      ownerId: req.user._id,
      name: name.trim(),
      variety: variety?.trim() || '',
      plantingDate,
      expectedHarvestDate: expectedHarvestDate || undefined,
      growthStage: growthStage || 'seedling',
      cultivatedArea: Number(cultivatedArea),
      irrigationMethod: irrigationMethod || farm.irrigationMethod || 'Drip',
      notes: notes || '',
      status: 'active',
      activities: [
        {
          title: 'Initial Soil Preparation & Seeding',
          type: 'inspection',
          dueDate: new Date(plantingDate),
          completed: true,
          completedAt: new Date(plantingDate),
          notes: 'Initial planting activity logged automatically'
        }
      ]
    });

    return sendSuccess(res, crop, 'Crop registered successfully', 201);
  } catch (err) {
    next(err);
  }
};

export const getCropById = async (req, res, next) => {
  try {
    const crop = await Crop.findById(req.params.id).populate('farmId', 'name location area areaUnit soilType');
    if (!crop) {
      return sendError(res, 'Crop not found', 404);
    }

    if (req.user.role !== 'admin' && crop.ownerId.toString() !== req.user._id.toString()) {
      return sendError(res, 'Access denied to this crop record', 403);
    }

    return sendSuccess(res, crop, 'Crop details retrieved');
  } catch (err) {
    next(err);
  }
};

export const updateCrop = async (req, res, next) => {
  try {
    const crop = await Crop.findById(req.params.id);
    if (!crop) {
      return sendError(res, 'Crop not found', 404);
    }

    if (req.user.role !== 'admin' && crop.ownerId.toString() !== req.user._id.toString()) {
      return sendError(res, 'Access denied. You cannot modify this crop.', 403);
    }

    const { name, variety, plantingDate, expectedHarvestDate, growthStage, cultivatedArea, irrigationMethod, status, notes } = req.body;

    if (name) crop.name = name.trim();
    if (variety !== undefined) crop.variety = variety.trim();
    if (plantingDate) crop.plantingDate = plantingDate;
    if (expectedHarvestDate !== undefined) crop.expectedHarvestDate = expectedHarvestDate;
    if (growthStage) crop.growthStage = growthStage;
    if (cultivatedArea) crop.cultivatedArea = Number(cultivatedArea);
    if (irrigationMethod) crop.irrigationMethod = irrigationMethod;
    if (status) crop.status = status;
    if (notes !== undefined) crop.notes = notes;

    await crop.save();
    return sendSuccess(res, crop, 'Crop updated successfully');
  } catch (err) {
    next(err);
  }
};

export const archiveCrop = async (req, res, next) => {
  try {
    const crop = await Crop.findById(req.params.id);
    if (!crop) {
      return sendError(res, 'Crop not found', 404);
    }

    if (req.user.role !== 'admin' && crop.ownerId.toString() !== req.user._id.toString()) {
      return sendError(res, 'Access denied', 403);
    }

    crop.status = 'archived';
    await crop.save();
    return sendSuccess(res, crop, 'Crop archived successfully');
  } catch (err) {
    next(err);
  }
};

export const addActivity = async (req, res, next) => {
  try {
    const crop = await Crop.findById(req.params.id);
    if (!crop) return sendError(res, 'Crop not found', 404);

    if (req.user.role !== 'admin' && crop.ownerId.toString() !== req.user._id.toString()) {
      return sendError(res, 'Access denied', 403);
    }

    const { title, type, dueDate, notes } = req.body;
    if (!title || !dueDate) {
      return sendError(res, 'Activity title and due date are required', 400);
    }

    crop.activities.push({
      title: title.trim(),
      type: type || 'inspection',
      dueDate,
      notes: notes || '',
      completed: false
    });

    await crop.save();
    return sendSuccess(res, crop, 'Activity scheduled successfully');
  } catch (err) {
    next(err);
  }
};

export const toggleActivity = async (req, res, next) => {
  try {
    const crop = await Crop.findById(req.params.id);
    if (!crop) return sendError(res, 'Crop not found', 404);

    if (req.user.role !== 'admin' && crop.ownerId.toString() !== req.user._id.toString()) {
      return sendError(res, 'Access denied', 403);
    }

    const activity = crop.activities.id(req.params.activityId);
    if (!activity) return sendError(res, 'Activity not found', 404);

    activity.completed = !activity.completed;
    activity.completedAt = activity.completed ? new Date() : null;

    await crop.save();
    return sendSuccess(res, crop, 'Activity status updated');
  } catch (err) {
    next(err);
  }
};

export const getCropsByFarm = async (req, res, next) => {
  try {
    const crops = await Crop.find({
      farmId: req.params.farmId,
      status: { $ne: 'archived' }
    }).sort({ createdAt: -1 });

    return sendSuccess(res, crops, 'Crops for farm retrieved');
  } catch (err) {
    next(err);
  }
};
