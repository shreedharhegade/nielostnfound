import mongoose, { Schema, model, models } from "mongoose";

export interface IAdminLog {
  _id?: string;
  adminEmail: string;
  action: "delete_item" | "expire_item" | "resolve_item" | "view_all";
  targetId?: string;
  details?: string;
  createdAt: Date;
}

const AdminLogSchema = new Schema<IAdminLog>(
  {
    adminEmail: { type: String, required: true },
    action: {
      type: String,
      enum: ["delete_item", "expire_item", "resolve_item", "view_all"],
      required: true,
    },
    targetId: { type: String },
    details: { type: String },
  },
  { timestamps: true }
);

AdminLogSchema.index({ adminEmail: 1, createdAt: -1 });
AdminLogSchema.index({ createdAt: -1 });

const AdminLog = models.AdminLog || model<IAdminLog>("AdminLog", AdminLogSchema);

export default AdminLog;
