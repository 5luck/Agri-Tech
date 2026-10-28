import mongoose from 'mongoose';

const weatherDataSchema = new mongoose.Schema(
  {
    farmId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Farm',
      required: true,
      index: true
    },
    ownerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    provider: {
      type: String,
      default: 'Open-Meteo'
    },
    coordinates: {
      latitude: { type: Number, required: true },
      longitude: { type: Number, required: true }
    },
    current: {
      temperature: Number,
      humidity: Number,
      windSpeed: Number,
      precipitation: Number,
      condition: String,
      weatherCode: Number
    },
    forecast: [
      {
        date: String,
        tempMax: Number,
        tempMin: Number,
        precipitationProbability: Number,
        precipitationSum: Number,
        condition: String,
        weatherCode: Number,
        windSpeedMax: Number
      }
    ],
    hourly: [
      {
        time: String,
        temperature: Number,
        precipitationProbability: Number,
        humidity: Number
      }
    ],
    fetchedAt: {
      type: Date,
      default: Date.now
    },
    expiresAt: {
      type: Date,
      required: true,
      index: true
    }
  },
  {
    timestamps: true
  }
);

export const WeatherData = mongoose.model('WeatherData', weatherDataSchema);
