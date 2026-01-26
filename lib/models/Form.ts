import mongoose from 'mongoose';

export interface IFormSubmission {
  _id?: string;
  formType: 'membership' | 'volunteer' | 'contact' | 'donation';
  data: Record<string, any>;
  status: 'submitted' | 'reviewed' | 'resolved';
  submittedAt: Date;
  submittedOffline?: boolean;
  notes?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

const formSubmissionSchema = new mongoose.Schema<IFormSubmission>(
  {
    formType: {
      type: String,
      enum: ['membership', 'volunteer', 'contact', 'donation'],
      required: true,
    },
    data: { type: mongoose.Schema.Types.Mixed, required: true },
    status: {
      type: String,
      enum: ['submitted', 'reviewed', 'resolved'],
      default: 'submitted',
    },
    submittedAt: { type: Date, default: Date.now },
    submittedOffline: { type: Boolean, default: false },
    notes: { type: String },
  },
  { timestamps: true }
);

export const FormSubmission =
  mongoose.models.FormSubmission ||
  mongoose.model<IFormSubmission>('FormSubmission', formSubmissionSchema);
