import mongoose from "mongoose";
import bcrypt from "bcryptjs"; // or "bcrypt" depending on what you installed

const fileSchema = new mongoose.Schema(
  {
    filename: { type: String, required: true },
    url: String,
    size: Number,
    public_id: { type: String, required: true },
    downloads: { type: Number, default: 0 },
    createdAt: { type: Date, default: Date.now },
    expiresAt: { type: Date },
    passwordHash: { type: String, default: null },
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  },
  { timestamps: true }
);

// virtual flag for UI convenience
fileSchema.virtual("hasPassword").get(function () {
  return !!this.passwordHash;
});

fileSchema.set("toJSON", { virtuals: true });
fileSchema.set("toObject", { virtuals: true });

export default mongoose.models.File || mongoose.model("File", fileSchema);
