import mongoose, { Schema, Document, Model, Types } from "mongoose";

export interface ICategory extends Document {
  name: string;
  slug: string;
  parent: Types.ObjectId | null;
  icon: string;
  displayOrder: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const CategorySchema = new Schema<ICategory>(
  {
    name: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, lowercase: true, trim: true },
    parent: { type: Schema.Types.ObjectId, ref: "Category", default: null },
    icon: { type: String, default: "bi-folder" },
    displayOrder: { type: Number, default: 0 },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

if (process.env.NODE_ENV !== "production" && mongoose.models.Category) {
  mongoose.deleteModel("Category");
}

const Category: Model<ICategory> =
  mongoose.models.Category ?? mongoose.model<ICategory>("Category", CategorySchema);

export default Category;

export function serializeCategory(category: ICategory) {
  return {
    id: category._id.toString(),
    name: category.name,
    slug: category.slug,
    parentId: category.parent?.toString() ?? null,
    icon: category.icon ?? "bi-folder",
    displayOrder: category.displayOrder ?? 0,
    isActive: category.isActive !== false,
    createdAt: category.createdAt,
    updatedAt: category.updatedAt,
  };
}
