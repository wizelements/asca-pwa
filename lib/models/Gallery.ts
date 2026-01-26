import mongoose from 'mongoose';

export interface IGalleryImage {
  _id?: string;
  title: string;
  imageUrl: string;
  alt: string;
  description?: string;
  category: string;
  featured: boolean;
  uploadedAt: Date;
  createdAt?: Date;
  updatedAt?: Date;
}

const galleryImageSchema = new mongoose.Schema<IGalleryImage>(
  {
    title: { type: String, required: true },
    imageUrl: { type: String, required: true },
    alt: { type: String, required: true },
    description: { type: String },
    category: { type: String, required: true },
    featured: { type: Boolean, default: false },
    uploadedAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

export const GalleryImage =
  mongoose.models.GalleryImage ||
  mongoose.model<IGalleryImage>('GalleryImage', galleryImageSchema);
