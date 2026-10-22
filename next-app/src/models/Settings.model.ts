// src/models/Settings.model.ts
// Simple settings document to store platform‑wide configuration such as base delivery rate

import mongoose, { Schema, model, Document, Model } from 'mongoose';

export interface ISettings extends Document {
  baseDeliveryRate: number; // e.g. GH₵35.00
  // Add more platform‑wide settings here as needed
}

const SettingsSchema = new Schema<ISettings>(
  {
    baseDeliveryRate: { type: Number, required: true, default: 35.0 },
  },
  { timestamps: true }
);

// Use a fixed collection name and a single document (singleton pattern)
export const SettingsModel =
  (mongoose.models?.Settings as Model<ISettings>) ||
  model<ISettings>('Settings', SettingsSchema);

export default SettingsModel;
