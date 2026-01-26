import mongoose from 'mongoose';

export interface ITheme {
  _id?: string;
  colors: {
    primary: string;
    secondary: string;
    accent: string;
    neutral: string;
  };
  fonts: {
    sans: string;
    serif: string;
  };
  logo: string;
  favicon: string;
  updatedAt?: Date;
  updatedBy?: string;
}

const themeSchema = new mongoose.Schema<ITheme>(
  {
    colors: {
      primary: { type: String, default: '#1a1a1a' },
      secondary: { type: String, default: '#4a4b02' },
      accent: { type: String, default: '#f5d800' },
      neutral: { type: String, default: '#ffffff' },
    },
    fonts: {
      sans: { type: String, default: 'system-ui' },
      serif: { type: String, default: 'Georgia' },
    },
    logo: { type: String, default: '' },
    favicon: { type: String, default: '' },
    updatedBy: { type: String },
  },
  { timestamps: true }
);

export const Theme =
  mongoose.models.Theme || mongoose.model<ITheme>('Theme', themeSchema);
