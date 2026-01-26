import mongoose from 'mongoose';

export interface ISettings {
  _id?: string;
  siteTitle: string;
  siteDescription: string;
  siteUrl: string;
  venmoUsername?: string;
  venmoPresets?: Array<{
    label: string;
    amount: number;
  }>;
  notificationsEnabled: boolean;
  maintenanceMode: boolean;
  updatedAt?: Date;
  updatedBy?: string;
}

const settingsSchema = new mongoose.Schema<ISettings>(
  {
    siteTitle: { type: String, default: 'Atlanta Saddle Club Association' },
    siteDescription: { type: String, default: 'We Ride To Inspire' },
    siteUrl: { type: String, required: true },
    venmoUsername: { type: String },
    venmoPresets: [
      {
        label: String,
        amount: Number,
      },
    ],
    notificationsEnabled: { type: Boolean, default: true },
    maintenanceMode: { type: Boolean, default: false },
    updatedBy: { type: String },
  },
  { timestamps: true }
);

export const Settings =
  mongoose.models.Settings ||
  mongoose.model<ISettings>('Settings', settingsSchema);
