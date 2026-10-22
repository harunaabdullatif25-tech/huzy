import mongoose, { Document, Schema, model } from 'mongoose';

// ─── Dimension unit ──────────────────────────────────────────────────────────

export type DimensionUnit = 'cm' | 'inches';

// ─── Quote status ────────────────────────────────────────────────────────────

export type QuoteStatus =
  | 'new'
  | 'reviewed'
  | 'proposal_sent'
  | 'accepted'
  | 'rejected';

// ─── Sizing mode ────────────────────────────────────────────────────────────

export type SizingMode = 'custom_dimensions' | 'vendor_decides';

// ─── Main interface ──────────────────────────────────────────────────────────

export interface IQuote extends Document {
  fullName: string;
  email: string;
  phone?: string;
  company?: string;
  boxType: string;
  sizingMode?: SizingMode;
  contentsDescription?: string;
  dimensions?: {
    length?: number;
    width?: number;
    height?: number;
    unit?: DimensionUnit;
  };
  quantity: number;
  materialType?: string;
  finishType?: string;
  printingRequirements?: string;
  additionalNotes?: string;
  status: QuoteStatus;
  adminNotes?: string;
  proposedPrice?: number;
  createdAt: Date;
  updatedAt: Date;
}

// ─── Schema ──────────────────────────────────────────────────────────────────

const QuoteSchema = new Schema<IQuote>(
  {
    fullName: { type: String, required: true },
    email: { type: String, required: true },
    phone: { type: String },
    company: { type: String },
    boxType: { type: String, required: true },
    sizingMode: {
      type: String,
      enum: ['custom_dimensions', 'vendor_decides'],
      default: 'custom_dimensions',
    },
    contentsDescription: { type: String },
    dimensions: {
      length: { type: Number },
      width: { type: Number },
      height: { type: Number },
      unit: { type: String, enum: ['cm', 'inches'], default: 'cm' },
    },
    quantity: { type: Number, required: true },
    materialType: { type: String },
    finishType: { type: String },
    printingRequirements: { type: String },
    additionalNotes: { type: String },
    status: {
      type: String,
      enum: ['new', 'reviewed', 'proposal_sent', 'accepted', 'rejected'],
      default: 'new',
    },
    adminNotes: { type: String },
    proposedPrice: { type: Number },
  },
  { timestamps: true },
);

// ─── Model (guard against re-compilation in dev hot-reload) ─────────────────

export const QuoteModel =
  (mongoose.models.Quote as mongoose.Model<IQuote>) ??
  model<IQuote>('Quote', QuoteSchema);
