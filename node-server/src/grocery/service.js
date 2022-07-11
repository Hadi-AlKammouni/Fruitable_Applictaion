const Grocery = require('../../model/grocery');
const Category = require('../../model/category');
const Item = require("../../model/item");
const Order = require('../../model/order');
const Element = require('../../model/element');

const bcrypt = require('bcryptjs');

async function addNewCategory(body) {
  const {
    name,
    picture,
  } = body;

  const category = new Category({
    name,
    picture,
  });

  return await category.save();
};

async function addNewItem(body) {
  const {
    name,
    price,
    quantity,
    picture,
    category,
    grocery,
  } = body;

  const item = new Item({
    name,
    price,
    quantity,
    picture,
    category,
    grocery,
  });

  return await item.save();
};

async function getGroceryStock(id) {
  return await Grocery.findById(id);
};

async function getGroceryItem(id) {
  return await Item.findById(id);
};

async function getCategories() {
  return await Category.find();
};

async function getCategoryById(id) {
  return await Category.findById(id);
};

async function addGrocery(body) {
  const {
    grocery_name,
    grocery_email,
    grocery_password,
    grocery_phone_number,
    grocery_location,
    grocery_picture,
    grocery_description,
    grocery_category,
    grocery_state,
    user,
  } = body;

  const grocery = new Grocery({
    grocery_name,
    grocery_email,
    grocery_password: await bcrypt.hash(grocery_password, 10),
    grocery_phone_number,
    grocery_location,
    grocery_picture,
    grocery_description,
    grocery_category,
    grocery_state,
    user,
  });

  return await grocery.save();
}

async function getOrder(id) {
  return await Order.findById(id);
};

async function getOrderElement(id) {
  return await Element.findById(id);
};

module.exports = {
    addNewCategory,
    addNewItem,
    getGroceryStock,
    getGroceryItem,
    getCategories,
    getCategoryById,
    addGrocery,
    getOrder,
    getOrderElement,
} 