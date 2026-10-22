// src/models/BoxProduct.model.ts
// Mongoose schemas and model for Box Products and Variants

import mongoose, { Document, Schema, model, Model } from 'mongoose';
import {
  BoxType,
  MaterialType,
  FluteType,
  FinishType,
  BoxColor,
  UseCaseCategory,
  IDimensionValues,
  IDimensions,
  ILoadCapacity,
  IBulkPricingTier,
  IBoxVariant,
  IBoxProduct,
} from '@/types/box.types';

// Re-export types and enums for backward compatibility on server
export * from '@/types/box.types';

export interface IBoxProductDocument extends Omit<IBoxProduct, '_id'>, Document {}

/*** Sub‑schemas ***/
const DimensionValuesSchema = new Schema<IDimensionValues>(
  {
    length: { type: Number, required: true },
    width: { type: Number, required: true },
    height: { type: Number, required: true },
  },
  { _id: false }
);

const DimensionsSchema = new Schema<IDimensions>(
  {
    cm: { type: DimensionValuesSchema, required: true },
    inches: { type: DimensionValuesSchema, required: true },
  },
  { _id: false }
);

const LoadCapacitySchema = new Schema<ILoadCapacity>(
  {
    kg: { type: Number, required: true },
    lbs: { type: Number, required: true },
  },
  { _id: false }
);

const BulkPricingTierSchema = new Schema<IBulkPricingTier>(
  {
    minQuantity: { type: Number, required: true },
    discountPercentage: { type: Number },
    unitPrice: { type: Number, required: true },
  },
  { _id: false }
);

const BoxVariantSchema = new Schema<IBoxVariant>(
  {
    sku: { type: String, required: true, unique: true },
    variantName: { type: String, required: true },
    dimensions: {
      outer: { type: DimensionsSchema, required: true },
      inner: { type: DimensionsSchema, required: true },
    },
    wallThicknessMm: { type: Number, required: true },
    fluteType: { type: String, enum: Object.values(FluteType), required: true },
    finishType: { type: String, enum: Object.values(FinishType), required: true },
    colorName: { type: String, enum: Object.values(BoxColor), required: true },
    colorHex: { type: String },
    loadCapacity: { type: LoadCapacitySchema, required: true },
    tareWeightGrams: { type: Number, required: true },
    burstStrengthPsi: { type: Number },
    price: { type: Number, required: true },
    costPrice: { type: Number },
    stockQuantity: { type: Number, required: true },
    bulkPricingTiers: { type: [BulkPricingTierSchema] },
    isAvailable: { type: Boolean, default: true },
    images: { type: [String], default: [] },
    customBrandingOptions: { type: Schema.Types.Mixed },
    minOrderQuantity: { type: Number },
  },
  { timestamps: false }
);

const BoxProductSchema = new Schema<IBoxProductDocument>(
  {
    title: { type: String, required: true },
    slug: { type: String, required: true, unique: true },
    description: { type: String },
    boxType: { type: String, enum: Object.values(BoxType), required: true },
    useCaseCategories: { type: [String], enum: Object.values(UseCaseCategory), required: true },
    availableColors: { type: [String], enum: Object.values(BoxColor) },
    materialType: { type: String, enum: Object.values(MaterialType), required: true },
    brand: { type: String, required: true },
    ecoFriendlyAttributes: {
      isRecyclable: { type: Boolean, default: false },
      isCompostable: { type: Boolean, default: false },
      recycledContentPercentage: { type: Number, default: 0 },
    },
    variants: { type: [BoxVariantSchema], default: [] },
    defaultVariantId: { type: Schema.Types.ObjectId },
    isActive: { type: Boolean, default: true },
    tags: { type: [String], default: [] },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
    customBrandingOptions: { type: Schema.Types.Mixed },
    minOrderQuantity: { type: Number },
  },
  { timestamps: true }
);

export const BoxProductModel =
  (mongoose.models?.BoxProduct as Model<IBoxProductDocument>) ||
  model<IBoxProductDocument>('BoxProduct', BoxProductSchema);

export default BoxProductModel;
