import mongoose from 'mongoose';

const alertSchema = new mongoose.Schema(
  {
    ownerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true
    },
    farmId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Farm',
      default: null
    },
    cropId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Crop',
      default: null
    },
    type: {
      type: String,
      enum: ['weather', 'pest', 'soil', 'activity', 'system'],
      default: 'system',
      index: true
    },
    title: {
      type: String,
      required: true,
      trim: true
    },
    description: {
      type: String,
      required: true,
      trim: true
    },
    severity: {
      type: String,
      enum: ['low', 'moderate', 'high', 'critical'],
      default: 'moderate'
    },
    source: {
      type: String,
      default: 'Agri-Tech System'
    },
    status: {
      type: String,
      enum: ['unread', 'read', 'dismissed'],
      default: 'unread',
      index: true
    },
    recommendedAction: {
      type: String,
      default: ''
    }
  },
  {
    timestamps: true
  }
);

export const Alert = mongoose.model('Alert', alertSchema);
