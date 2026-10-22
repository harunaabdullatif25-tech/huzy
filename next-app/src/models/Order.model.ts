import mongoose, { Document, Schema, model, Types } from 'mongoose';

// ─── Sub-document interfaces ────────────────────────────────────────────────

export interface IOrderCustomer {
  fullName: string;
  email: string;
  phone?: string;
}

export interface IDeliveryAddress {
  fullName: string;
  streetAddress?: string;
  apartmentOrUnit?: string;
  landmarkOrInstructions?: string;
  city: string;
  stateOrProvince?: string;
  postalCode?: string;
  countryCode: string;
  digitalAddressGps?: string;
}

export interface IOrderItem {
  productId: Types.ObjectId;
  variantSku: string;
  variantName: string;
  quantity: number;
  unitPrice: number;
  subtotal: number;
  customDimensions?: {
    length: number;
    width: number;
    height: number;
    unit: string;
  };
  customColor?: string;
  printOption?: string;
  brandingNotes?: string;
  customLogoUrl?: string;
}

// ─── Delivery tier enum ──────────────────────────────────────────────────────

export type DeliveryTier =
  | 'EXPRESS_SAME_DAY'
  | 'EXPRESS_NEXT_DAY'
  | 'SCHEDULED_PRIORITY'
  | 'STANDARD';

// ─── Order status enum ───────────────────────────────────────────────────────

export type OrderStatus =
  | 'pending'
  | 'paid'
  | 'processing'
  | 'shipped'
  | 'delivered'
  | 'cancelled';

// ─── Main interface ──────────────────────────────────────────────────────────

export interface IOrder extends Document {
  orderNumber: string;
  customer: IOrderCustomer;
  deliveryAddress: IDeliveryAddress;
  items: IOrderItem[];
  preferredDeliveryDate?: Date;
  deliveryTier: DeliveryTier;
  baseDeliveryRate: number;
  deliveryFee: number;
  deliveryMultiplier: number;
  subtotal: number;
  total: number;
  status: OrderStatus;
  paystackReference?: string;
  createdAt: Date;
  updatedAt: Date;
}

// ─── Schema ──────────────────────────────────────────────────────────────────

const OrderItemSchema = new Schema<IOrderItem>(
  {
    productId: { type: Schema.Types.ObjectId, ref: 'BoxProduct', required: true },
    variantSku: { type: String, required: true },
    variantName: { type: String, required: true },
    quantity: { type: Number, required: true },
    unitPrice: { type: Number, required: true },
    subtotal: { type: Number, required: true },
    customDimensions: {
      length: { type: Number },
      width: { type: Number },
      height: { type: Number },
      unit: { type: String },
    },
    customColor: { type: String },
    printOption: { type: String },
    brandingNotes: { type: String },
    customLogoUrl: { type: String },
  },
  { _id: false },
);

const OrderSchema = new Schema<IOrder>(
  {
    orderNumber: {
      type: String,
      unique: true,
      required: true,
    },
    customer: {
      fullName: { type: String, required: true },
      email: { type: String, required: true },
      phone: { type: String },
    },
    deliveryAddress: {
      fullName: { type: String, required: true },
      streetAddress: { type: String },
      apartmentOrUnit: { type: String },
      landmarkOrInstructions: { type: String },
      city: { type: String, required: true },
      stateOrProvince: { type: String },
      postalCode: { type: String },
      countryCode: { type: String, required: true },
      digitalAddressGps: { type: String },
    },
    items: { type: [OrderItemSchema], default: [] },
    preferredDeliveryDate: { type: Date },
    deliveryTier: {
      type: String,
      enum: ['EXPRESS_SAME_DAY', 'EXPRESS_NEXT_DAY', 'SCHEDULED_PRIORITY', 'STANDARD'],
      required: true,
    },
    baseDeliveryRate: { type: Number, required: true },
    deliveryFee: { type: Number, required: true },
    deliveryMultiplier: { type: Number, required: true },
    subtotal: { type: Number, required: true },
    total: { type: Number, required: true },
    status: {
      type: String,
      enum: ['pending', 'paid', 'processing', 'shipped', 'delivered', 'cancelled'],
      default: 'pending',
    },
    paystackReference: { type: String },
  },
  { timestamps: true },
);

// ─── Model (guard against re-compilation in dev hot-reload) ─────────────────

export const OrderModel =
  (mongoose.models.Order as mongoose.Model<IOrder>) ??
  model<IOrder>('Order', OrderSchema);
