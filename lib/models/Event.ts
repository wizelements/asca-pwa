import mongoose from 'mongoose';

export interface IEvent {
  _id?: string;
  title: string;
  description: string;
  date: Date;
  endDate: Date;
  location: string;
  imageUrl?: string;
  imageAlt: string;
  capacity?: number;
  registrationDeadline?: Date;
  rsvpList: string[];
  published: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

const eventSchema = new mongoose.Schema<IEvent>(
  {
    title: { type: String, required: true },
    description: { type: String, required: true },
    date: { type: Date, required: true },
    endDate: { type: Date, required: true },
    location: { type: String, required: true },
    imageUrl: { type: String },
    imageAlt: { type: String, required: true },
    capacity: { type: Number },
    registrationDeadline: { type: Date },
    rsvpList: [String],
    published: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export const Event =
  mongoose.models.Event || mongoose.model<IEvent>('Event', eventSchema);
