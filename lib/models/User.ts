import mongoose from 'mongoose';

export interface IUser {
  _id?: string;
  email: string;
  password: string;
  name?: string;
  role: 'admin' | 'editor' | 'viewer';
  permissions: string[];
  isActive: boolean;
  lastLogin?: Date;
  createdAt?: Date;
  updatedAt?: Date;
}

const userSchema = new mongoose.Schema<IUser>(
  {
    email: { type: String, required: true, unique: true, lowercase: true },
    password: { type: String, required: true },
    name: { type: String },
    role: { type: String, enum: ['admin', 'editor', 'viewer'], default: 'viewer' },
    permissions: [String],
    isActive: { type: Boolean, default: true },
    lastLogin: { type: Date },
  },
  { timestamps: true }
);

// Hash password before saving
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  try {
    const bcrypt = await import('bcrypt');
    const salt = await bcrypt.default.genSalt(10);
    this.password = await bcrypt.default.hash(this.password, salt);
    next();
  } catch (error) {
    next(error as Error);
  }
});

export const User =
  mongoose.models.User || mongoose.model<IUser>('User', userSchema);
