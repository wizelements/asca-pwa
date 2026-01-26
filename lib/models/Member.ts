import mongoose from 'mongoose';

export interface IMember {
  _id?: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  roles: ('rider' | 'volunteer' | 'instructor')[];
  joinDate: Date;
  profileImage?: string;
  bio?: string;
  experience?: string;
  isVerified: boolean;
  isActive: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

const memberSchema = new mongoose.Schema<IMember>(
  {
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    phone: { type: String },
    roles: [{ type: String, enum: ['rider', 'volunteer', 'instructor'] }],
    joinDate: { type: Date, default: Date.now },
    profileImage: { type: String },
    bio: { type: String },
    experience: { type: String },
    isVerified: { type: Boolean, default: false },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export const Member =
  mongoose.models.Member || mongoose.model<IMember>('Member', memberSchema);
