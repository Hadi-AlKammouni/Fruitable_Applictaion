const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema({
  user: {type: mongoose.Schema.Types.ObjectId, ref: "User"},
  grocery: {type: mongoose.Schema.Types.ObjectId, ref: "Grocery"},
  username: {type: String, default: null},
  items: [{
    name: {type: String},
    price: {type: Number},
    picture: { type: String} , 
    quantity: { type: String}  
  }],
});

module.exports = mongoose.model("order", orderSchema);