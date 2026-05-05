import mongoose, { Schema, model, models } from "mongoose";

export interface IItem {
  _id?: string;
  title: string;
  description: string;
  type: "lost" | "found";
  category: string;
  location: string;
  date: Date;
  imageUrl?: string;
  reporterEmail: string;
  reporterName: string;
  reporterPhone?: string;
  status: "open" | "resolved" | "expired";
  deletedAt?: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

const ItemSchema = new Schema<IItem>(
  {
    title: { type: String, required: true, maxlength: 100, trim: true },
    description: { type: String, required: true, maxlength: 500, trim: true },
    type: { type: String, enum: ["lost", "found"], required: true },
    category: {
      type: String,
      enum: ["Electronics", "Keys", "Documents", "Clothing", "Other"],
      default: "Other",
    },
    location: { type: String, required: true, maxlength: 200, trim: true },
    date: { type: Date, required: true },
    imageUrl: { type: String },
    reporterEmail: { type: String, required: true, lowercase: true, trim: true },
    reporterName: { type: String, required: true, trim: true },
    reporterPhone: { type: String },
    status: {
      type: String,
      enum: ["open", "resolved", "expired"],
      default: "open",
    },
    // Soft-delete: null means active, a Date means deleted
    deletedAt: { type: Date, default: null },
  },
  { timestamps: true }
);

// --- Indexes for query performance ---
ItemSchema.index({ type: 1, status: 1, date: -1 });   // main dashboard
ItemSchema.index({ reporterEmail: 1, createdAt: -1 }); // user history
ItemSchema.index({ deletedAt: 1 });                     // soft-delete filter
ItemSchema.index({ title: "text", description: "text" }); // full-text search
ItemSchema.index({ category: 1, status: 1 });          // category filter

const Item = models.Item || model<IItem>("Item", ItemSchema);

export default Item;
