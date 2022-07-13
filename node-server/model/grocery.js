const mongoose = require("mongoose");

const grocerySchema = new mongoose.Schema({
  name: { type: String, default: null },
  email: { type: String, unique: true },
  password: { type: String },
  phone_number: { type: String, default: null },
  location: {
    type: {
      type: String,
      enum: ["Point"],
      required: false,
    },
    coordinates: {
      type: [Number],
      required: false,
    },
  },
  picture: { type: String, default: null },
  description: { type: String, default: null  },
  token: { type: String },
  categories: { type: Array, default: null },
  items: [{type: mongoose.Schema.Types.ObjectId, ref: "item"}],
  reviews: ["Reviews"],
  orders: [{type: mongoose.Schema.Types.ObjectId, ref: "order"}],
});

grocerySchema.index({location:"2dsphere"});
module.exports = mongoose.model("grocery", grocerySchema);