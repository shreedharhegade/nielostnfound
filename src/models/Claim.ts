import mongoose, { Schema, model, models } from "mongoose";

export interface IClaim {
  _id?: string;
  itemId: mongoose.Types.ObjectId;
  claimerEmail: string;
  claimerName: string;
  message: string;
  status: "pending" | "accepted" | "rejected";
  createdAt: Date;
  updatedAt: Date;
}

const ClaimSchema = new Schema<IClaim>(
  {
    itemId: { type: Schema.Types.ObjectId, ref: "Item", required: true },
    claimerEmail: { type: String, required: true, lowercase: true, trim: true },
    claimerName: { type: String, required: true, trim: true },
    message: { type: String, required: true, maxlength: 500, trim: true },
    status: {
      type: String,
      enum: ["pending", "accepted", "rejected"],
      default: "pending",
    },
  },
  { timestamps: true }
);

ClaimSchema.index({ itemId: 1 });
ClaimSchema.index({ claimerEmail: 1 });
// Prevent duplicate claims from the same person on the same item
ClaimSchema.index({ itemId: 1, claimerEmail: 1 }, { unique: true });

const Claim = models.Claim || model<IClaim>("Claim", ClaimSchema);

export default Claim;
