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
  status: "open" | "resolved";
  createdAt: Date;
}

const ItemSchema = new Schema<IItem>({
  title: { type: String, required: true },
  description: { type: String, required: true },
  type: { type: String, enum: ["lost", "found"], required: true },
  category: { type: String, default: "Other" },
  location: { type: String, required: true },
  date: { type: Date, required: true },
  imageUrl: { type: String },
  reporterEmail: { type: String, required: true },
  reporterName: { type: String, required: true },
  status: { type: String, enum: ["open", "resolved"], default: "open" },
  createdAt: { type: Date, default: Date.now }
});

const Item = models.Item || model<IItem>("Item", ItemSchema);

export default Item;
