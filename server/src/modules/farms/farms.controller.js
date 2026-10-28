import { Farm } from '../../models/Farm.js';
import { Crop } from '../../models/Crop.js';
import { SoilRecord } from '../../models/SoilRecord.js';
import { Alert } from '../../models/Alert.js';
import { fetchWeatherForFarm } from '../../services/weather/weatherProvider.js';
import { sendSuccess, sendError } from '../../utils/apiResponse.js';

export const listFarms = async (req, res, next) => {
  try {
    const filter = req.user.role === 'admin' ? {} : { ownerId: req.user._id };
    if (req.query.status) {
      filter.status = req.query.status;
    } else {
      filter.status = 'active';
    }

    const farms = await Farm.find(filter).sort({ createdAt: -1 });
    return sendSuccess(res, farms, 'Farms retrieved successfully');
  } catch (err) {
    next(err);
  }
};

export const createFarm = async (req, res, next) => {
  try {
    const { name, location, area, areaUnit, soilType, irrigationMethod, description } = req.body;

    if (!name || !location?.state || !location?.district || !area) {
      return sendError(res, 'Name, state, district, and area are required', 400);
    }

    if (area <= 0) {
      return sendError(res, 'Area must be greater than zero', 400);
    }

    const farm = await Farm.create({
      ownerId: req.user._id,
      name: name.trim(),
      location: {
        state: location.state.trim(),
        district: location.district.trim(),
        village: location.village?.trim() || '',
        latitude: location.latitude ? Number(location.latitude) : undefined,
        longitude: location.longitude ? Number(location.longitude) : undefined
      },
      area: Number(area),
      areaUnit: areaUnit || 'acre',
      soilType: soilType || 'Loamy',
      irrigationMethod: irrigationMethod || 'Drip',
      description: description || '',
      status: 'active'
    });

    return sendSuccess(res, farm, 'Farm created successfully', 201);
  } catch (err) {
    next(err);
  }
};

export const getFarmById = async (req, res, next) => {
  try {
    const farm = await Farm.findById(req.params.id);
    if (!farm) {
      return sendError(res, 'Farm not found', 404);
    }

    // Ownership check
    if (req.user.role !== 'admin' && farm.ownerId.toString() !== req.user._id.toString()) {
      return sendError(res, 'Access denied. You do not have permission to view this farm.', 403);
    }

    return sendSuccess(res, farm, 'Farm retrieved');
  } catch (err) {
    next(err);
  }
};

export const updateFarm = async (req, res, next) => {
  try {
    const farm = await Farm.findById(req.params.id);
    if (!farm) {
      return sendError(res, 'Farm not found', 404);
    }

    if (req.user.role !== 'admin' && farm.ownerId.toString() !== req.user._id.toString()) {
      return sendError(res, 'Access denied. You cannot modify this farm.', 403);
    }

    const { name, location, area, areaUnit, soilType, irrigationMethod, description, status } = req.body;

    if (name) farm.name = name.trim();
    if (area) {
      if (area <= 0) return sendError(res, 'Area must be greater than zero', 400);
      farm.area = Number(area);
    }
    if (areaUnit) farm.areaUnit = areaUnit;
    if (soilType) farm.soilType = soilType;
    if (irrigationMethod) farm.irrigationMethod = irrigationMethod;
    if (description !== undefined) farm.description = description;
    if (status) farm.status = status;

    if (location) {
      if (location.state) farm.location.state = location.state.trim();
      if (location.district) farm.location.district = location.district.trim();
      if (location.village !== undefined) farm.location.village = location.village.trim();
      if (location.latitude !== undefined) farm.location.latitude = Number(location.latitude);
      if (location.longitude !== undefined) farm.location.longitude = Number(location.longitude);
    }

    await farm.save();
    return sendSuccess(res, farm, 'Farm updated successfully');
  } catch (err) {
    next(err);
  }
};

export const archiveFarm = async (req, res, next) => {
  try {
    const farm = await Farm.findById(req.params.id);
    if (!farm) {
      return sendError(res, 'Farm not found', 404);
    }

    if (req.user.role !== 'admin' && farm.ownerId.toString() !== req.user._id.toString()) {
      return sendError(res, 'Access denied. You cannot archive this farm.', 403);
    }

    farm.status = 'archived';
    await farm.save();

    return sendSuccess(res, farm, 'Farm archived successfully');
  } catch (err) {
    next(err);
  }
};

export const getFarmSummary = async (req, res, next) => {
  try {
    const farm = await Farm.findById(req.params.farmId);
    if (!farm) {
      return sendError(res, 'Farm not found', 404);
    }

    if (req.user.role !== 'admin' && farm.ownerId.toString() !== req.user._id.toString()) {
      return sendError(res, 'Access denied to this farm summary', 403);
    }

    const crops = await Crop.find({ farmId: farm._id, status: 'active' });
    const latestSoil = await SoilRecord.findOne({ farmId: farm._id }).sort({ measuredAt: -1 });
    const weatherResult = await fetchWeatherForFarm(farm);
    const alerts = await Alert.find({ farmId: farm._id, status: { $ne: 'dismissed' } }).sort({ createdAt: -1 }).limit(5);

    return sendSuccess(res, {
      farm,
      crops,
      latestSoil,
      weather: weatherResult.data,
      isWeatherCached: weatherResult.isCached,
      alerts
    }, 'Farm summary retrieved');
  } catch (err) {
    next(err);
  }
};
