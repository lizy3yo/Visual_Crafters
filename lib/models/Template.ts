import mongoose, { Schema, Model, Document } from 'mongoose';

export interface ITemplate extends Document {
  title:       string;
  description: string;
  price:       number;
  category:    string;
  imageUrl:    string;
  imagePublicId: string;
  status:      'published' | 'draft';
  createdAt:   Date;
  updatedAt:   Date;
}

const TemplateSchema = new Schema<ITemplate>(
  {
    title: {
      type:     String,
      required: [true, 'Title is required.'],
      trim:     true,
      maxlength: [100, 'Title must be 100 characters or fewer.'],
    },
    description: {
      type:     String,
      required: [true, 'Description is required.'],
      trim:     true,
      maxlength: [1000, 'Description must be 1000 characters or fewer.'],
    },
    price: {
      type:    Number,
      required: [true, 'Price is required.'],
      min:     [0, 'Price cannot be negative.'],
    },
    category: {
      type:     String,
      required: [true, 'Category is required.'],
      trim:     true,
    },
    imageUrl: {
      type:     String,
      required: [true, 'Image URL is required.'],
    },
    imagePublicId: {
      type:     String,
      required: [true, 'Image public ID is required.'],
    },
    status: {
      type:    String,
      enum:    ['published', 'draft'],
      default: 'published',
    },
  },
  {
    timestamps: true,
    // Compound index for fast category + status queries
    // Individual indexes defined below
  }
);

// ── Indexes ───────────────────────────────────────────────────────────────────
TemplateSchema.index({ category: 1, status: 1 });
TemplateSchema.index({ createdAt: -1 });
TemplateSchema.index({ title: 'text', description: 'text' });

const Template: Model<ITemplate> =
  mongoose.models.Template ||
  mongoose.model<ITemplate>('Template', TemplateSchema);

export default Template;
