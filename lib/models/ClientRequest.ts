import mongoose, { Schema, Model, Document } from 'mongoose';

export type RequestStatus = 'Pending' | 'In Progress' | 'Completed' | 'Cancelled';

export interface IClientRequest extends Document {
  fullName:    string;
  contact:     string;
  email:       string;
  service:     string;
  deadline:    string;
  description: string;
  templateId?:    string;
  templateTitle?: string;
  templatePrice?: number;
  fileUrl?:    string;
  filePublicId?: string;
  status:      RequestStatus;
  createdAt:   Date;
  updatedAt:   Date;
}

const ClientRequestSchema = new Schema<IClientRequest>(
  {
    fullName:    { type: String, required: true, trim: true, maxlength: 100 },
    contact:     { type: String, required: true, trim: true, maxlength: 30  },
    email:       { type: String, required: true, trim: true, lowercase: true, match: [/\S+@\S+\.\S+/, 'Invalid email'] },
    service:     { type: String, required: true, trim: true },
    deadline:    { type: String, required: true },
    description: { type: String, trim: true, maxlength: 2000, default: '' },
    templateId:    { type: String },
    templateTitle: { type: String, trim: true },
    templatePrice: { type: Number, min: 0 },
    fileUrl:       { type: String },
    filePublicId:  { type: String },
    status: {
      type:    String,
      enum:    ['Pending', 'In Progress', 'Completed', 'Cancelled'],
      default: 'Pending',
    },
  },
  { timestamps: true }
);

// ── Indexes ───────────────────────────────────────────────────────────────────
ClientRequestSchema.index({ status: 1, createdAt: -1 });
ClientRequestSchema.index({ email: 1 });
ClientRequestSchema.index({ createdAt: -1 });
ClientRequestSchema.index({ templateId: 1 });

const ClientRequest: Model<IClientRequest> =
  mongoose.models.ClientRequest ||
  mongoose.model<IClientRequest>('ClientRequest', ClientRequestSchema);

export default ClientRequest;
