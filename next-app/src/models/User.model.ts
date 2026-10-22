import mongoose, { Document, Schema, model } from 'mongoose';

export interface IUserAddress {
  streetAddress?: string;
  apartmentOrUnit?: string;
  landmarkOrInstructions?: string;
  city?: string;
  stateOrProvince?: string;
  postalCode?: string;
  countryCode?: string;
  digitalAddressGps?: string;
}

export interface IUser extends Document {
  name: string;
  email: string;
  password?: string;
  phone?: string;
  role: 'customer' | 'admin';
  address?: IUserAddress;
  createdAt: Date;
  updatedAt: Date;
}

const AddressSchema = new Schema<IUserAddress>(
  {
    streetAddress: { type: String, trim: true },
    apartmentOrUnit: { type: String, trim: true },
    landmarkOrInstructions: { type: String, trim: true },
    city: { type: String, trim: true },
    stateOrProvince: { type: String, trim: true },
    postalCode: { type: String, trim: true },
    countryCode: { type: String, default: 'GH', trim: true },
    digitalAddressGps: { type: String, trim: true },
  },
  { _id: false }
);

const UserSchema = new Schema<IUser>(
  {
    name: {
      type: String,
      required: [true, 'Full name is required'],
      trim: true,
    },
    email: {
      type: String,
      required: [true, 'Email address is required'],
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
    },
    phone: {
      type: String,
      trim: true,
    },
    role: {
      type: String,
      enum: ['customer', 'admin'],
      default: 'customer',
      required: true,
    },
    address: {
      type: AddressSchema,
      default: undefined,
    },
  },
  {
    timestamps: true,
  }
);

export const UserModel =
  (mongoose.models.User as mongoose.Model<IUser>) ??
  model<IUser>('User', UserSchema);
