import mongoose from 'mongoose';

const communityPostSchema = new mongoose.Schema(
  {
    authorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true
    },
    title: {
      type: String,
      required: true,
      trim: true
    },
    body: {
      type: String,
      required: true,
      trim: true
    },
    category: {
      type: String,
      enum: ['general', 'crops', 'soil_health', 'pest_control', 'weather', 'equipment', 'market_trends'],
      default: 'general',
      index: true
    },
    tags: [{ type: String, trim: true }],
    status: {
      type: String,
      enum: ['published', 'hidden', 'removed'],
      default: 'published',
      index: true
    },
    commentCount: {
      type: Number,
      default: 0
    },
    reports: [
      {
        reporterId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        reason: { type: String, required: true },
        createdAt: { type: Date, default: Date.now }
      }
    ]
  },
  {
    timestamps: true
  }
);

export const CommunityPost = mongoose.model('CommunityPost', communityPostSchema);
