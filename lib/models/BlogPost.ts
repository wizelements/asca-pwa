import mongoose from 'mongoose';

export interface IBlogPost {
  _id?: string;
  title: string;
  slug: string;
  content: string;
  excerpt?: string;
  author: string;
  categories: string[];
  imageUrl?: string;
  imageAlt?: string;
  published: boolean;
  publishedAt?: Date;
  viewCount: number;
  createdAt?: Date;
  updatedAt?: Date;
}

const blogPostSchema = new mongoose.Schema<IBlogPost>(
  {
    title: { type: String, required: true },
    slug: { type: String, required: true, unique: true },
    content: { type: String, required: true },
    excerpt: { type: String },
    author: { type: String, required: true },
    categories: [String],
    imageUrl: { type: String },
    imageAlt: { type: String },
    published: { type: Boolean, default: false },
    publishedAt: { type: Date },
    viewCount: { type: Number, default: 0 },
  },
  { timestamps: true }
);

export const BlogPost =
  mongoose.models.BlogPost ||
  mongoose.model<IBlogPost>('BlogPost', blogPostSchema);
