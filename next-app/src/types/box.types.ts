// src/types/box.types.ts
// Pure TypeScript enums and interfaces for Box and Packaging products (Safe for both Client and Server)

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

export interface ICustomBrandingOptions {
  printColors?: string[];
  printPlacement?: 'exterior_only' | 'interior_only' | 'both_sides';
  foilStamping?: boolean;
  embossing?: boolean;
}

export interface IBoxVariant {
  _id?: any;
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
  customBrandingOptions?: ICustomBrandingOptions;
  minOrderQuantity?: number;
}

export interface IBoxProduct {
  _id?: any;
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
  defaultVariantId?: any;
  isActive: boolean;
  tags: string[];
  createdAt: Date;
  updatedAt: Date;
  customBrandingOptions?: ICustomBrandingOptions;
  minOrderQuantity?: number;
}
