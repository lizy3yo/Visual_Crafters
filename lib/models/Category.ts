import mongoose, { Schema, Model, Document } from 'mongoose';

export interface ICategory extends Document {
  name:      string;
  isDefault: boolean;
  createdAt: Date;
}

const CategorySchema = new Schema<ICategory>(
  {
    name:      { type: String, required: true, unique: true, trim: true },
    isDefault: { type: Boolean, default: false },
  },
  { timestamps: true }
);

CategorySchema.index({ name: 1 }, { unique: true });

const Category: Model<ICategory> =
  mongoose.models.Category ||
  mongoose.model<ICategory>('Category', CategorySchema);

export default Category;
