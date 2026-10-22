// src/models/BoxProduct.model.ts
// Mongoose schemas and TypeScript models for Box Products and Variants

import { Document, Schema, model, Types } from 'mongoose';

/*** Enums ***/
export enum BoxType {
  SHIPPING_BOX = 'Shipping Box',
  MAILER_BOX = 'Mailer Box',
  GIFT_BOX = 'Gift Box',
  HEAVY_DUTY_STORAGE = 'Heavy-Duty Storage',
  FOLDING_CARTON = 'Folding Carton',
  RIGID_BOX = 'Rigid Box',
  BALLOON_BOX = 'Balloon Box',
  BAKERY_CAKE_BOX = 'Bakery & Cake Box',
  APPAREL_CLOTHING_BOX = 'Apparel & Clothing Box',
  JEWELRY_SMALL_GIFT_BOX = 'Jewelry & Small Gift Box',
  SHOE_BOX = 'Shoe Box',
  MOVING_STORAGE_BOX = 'Moving & Storage Box',
  WINE_BOTTLE_BOX = 'Wine & Bottle Box',
  PIZZA_FOOD_DELIVERY_BOX = 'Pizza & Food Delivery Box',
  WATCH_BOX = 'Watch Box',
}

export enum MaterialType {
  SINGLE_WALL = 'Single Wall Corrugated',
  DOUBLE_WALL = 'Double Wall Corrugated',
  TRIPLE_WALL = 'Triple Wall Corrugated',
  RIGID = 'Rigid Board',
  KRAFT_PAPER = 'Kraft Paper',
  WHITE_CORRUGATED = 'White Corrugated',
}

export enum FluteType {
  A_FLUTE = 'A-Flute',
  B_FLUTE = 'B-Flute',
  C_FLUTE = 'C-Flute',
  E_FLUTE = 'E-Flute',
  F_FLUTE = 'F-Flute',
  BC_FLUTE = 'BC-Flute (Double Wall)',
  EB_FLUTE = 'EB-Flute (Double Wall)',
  NONE = 'N/A',
}

export enum FinishType {
  MATTE = 'Matte',
  GLOSS = 'Gloss',
  UNCOATED = 'Uncoated',
  SOFT_TOUCH = 'Soft-Touch Matte',
  UV_COATED = 'UV Coated',
  KRAFT_NATURAL = 'Kraft Natural',
}

export enum BoxColor {
  KRAFT_NATURAL = 'Kraft Natural',
  WHITE = 'White',
  BLACK = 'Black',
  RED = 'Red',
  PINK = 'Pink',
  GOLD = 'Gold',
  SILVER = 'Silver',
  CUSTOM_PRINTED = 'Custom Printed',
}

export enum UseCaseCategory {
  APPAREL_CLOTHING = 'Apparel & Clothing',
  ELECTRONICS_GADGETS = 'Electronics & Gadgets',
  FRAGILE_GLASSWARE = 'Fragile & Glassware',
  FOOD_BAKERY = 'Food & Bakery',
  BOOKS_DOCUMENTS = 'Books & Documents',
  COSMETICS_BEAUTY = 'Cosmetics & Beauty',
  ECOMMERCE_SHIPPING = 'E-Commerce Shipping',
  HEAVY_INDUSTRIAL = 'Heavy Industrial',
  MOVING_STORAGE = 'Moving & Storage',
  BALLOON_BOXES = 'Balloon Boxes',
  WATCH_JEWELRY_BOXES = 'Watch & Jewelry Boxes',
}

/*** Sub‑document interfaces ***/
export interface IDimensionValues {
  length: number;
  width: number;
  height: number;
}

export interface IDimensions {
  cm: IDimensionValues;
  inches: IDimensionValues;
}

export interface ILoadCapacity {
  kg: number;
  lbs: number;
}

export interface IBulkPricingTier {
  minQuantity: number;
  discountPercentage?: number;
  unitPrice: number;
}

export interface IBoxVariant {
  _id?: Types.ObjectId;
  sku: string;
  variantName: string;
  dimensions: {
    outer: IDimensions;
    inner: IDimensions;
  };
  wallThicknessMm: number;
  fluteType: FluteType;
  finishType: FinishType;
  colorName: BoxColor;
  colorHex?: string;
  loadCapacity: ILoadCapacity;
  tareWeightGrams: number;
  burstStrengthPsi?: number;
  price: number;
  costPrice?: number;
  stockQuantity: number;
  bulkPricingTiers?: IBulkPricingTier[];
  isAvailable: boolean;
  images: string[];
  customBrandingOptions?: any; // Define more concretely when needed
  minOrderQuantity?: number;
}

/*** Main product interface ***/
export interface IBoxProduct extends Document {
  title: string;
  slug: string;
  description: string;
  boxType: BoxType;
  useCaseCategories: UseCaseCategory[];
  availableColors?: BoxColor[];
  materialType: MaterialType;
  brand: string;
  ecoFriendlyAttributes: {
    isRecyclable: boolean;
    isCompostable: boolean;
    recycledContentPercentage: number;
  };
  variants: IBoxVariant[];
  defaultVariantId?: Types.ObjectId;
  isActive: boolean;
  tags: string[];
  createdAt: Date;
  updatedAt: Date;
  customBrandingOptions?: any;
  minOrderQuantity?: number;
}

/*** Mongoose sub‑schemas ***/
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

/*** Main product schema ***/
const BoxProductSchema = new Schema<IBoxProduct>(
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

// Pre‑save hook to update `updatedAt`
BoxProductSchema.pre('save', function (next) {
  this.updatedAt = new Date();
  next();
});

export const BoxProductModel = model<IBoxProduct>('BoxProduct', BoxProductSchema);
