const mongoose = require("mongoose");

const vehicleSchema = new mongoose.Schema({
  make: String,
  model: String,
  plateNumber: String,
  color: String,
});
const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: false, // ✅ now works for OAuth users
    },
  },
  {
    timestamps: true, // adds createdAt and updatedAt fields
  }
);

module.exports = mongoose.model("User", userSchema);
