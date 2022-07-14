const { addNewItem, getGroceryStock, getGroceryItem, getOrder, getOrderElement } = require('../service');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const Grocery = require("../../../model/grocery");
const Item = require("../../../model/item");

// Register grocery logic
async function register (req, res) {
  
  try {
    // Get grocery input
    const { name, email, password, phone_number, location, picture, description } = req.body;
    
    // Validate grocery input
    if (!(email && password && name &&  phone_number && location && picture && description)) {
      res.status(400).send("All input are required");
    }
    
    // Validate if grocery exist in our database
    const oldGrocery = await Grocery.findOne({ email });

    if (oldGrocery) {
      return res.status(409).send("Grocery Already Exist. Please Login");
    }
    
    // Encrypt grocery password
    encryptedPassword = await bcrypt.hash(password, 10);

    // Create grocery in our database
    const grocery = await Grocery.create({
      name,
      email: email.toLowerCase(), // Sanitize: convert email to lowercase
      password: encryptedPassword,
      phone_number,
      location,
      picture,
      description,
    });
    
    // Create token
    const token = jwt.sign(
      { grocery_id: grocery._id, email },
      process.env.TOKEN_KEY,
      {
        expiresIn: "2h",
      }
    );
    // Save grocery token
    grocery.token = token;

    // Return new grocery
    res.status(201).json(grocery);
  } catch (err) {
    console.log(err);
  }
  // Our register logic ends here
};

// Login grocery logic
async function login (req, res) {

  try {
    // Get grocery input
    const { email, password } = req.body;

    // Validate grocery input
    if (!(email && password)) {
      res.status(400).send("All input is required");
    }

    email.toLowerCase()
    // Validate if grocery exist in our database
    const grocery = await Grocery.findOne({ email });
    
    if (grocery && (await bcrypt.compare(password, grocery.password))) {
      // Create token
      const token = jwt.sign(
        { grocery_id: grocery._id, email },
        process.env.TOKEN_KEY,
        {
          expiresIn: "2h",
        }
      );
      
      // Save grocery token
      grocery.token = token;
      
      // Return grocery
      res.status(200).json(grocery);
    }else{
      res.status(400).send("Invalid Credentials - Wrong email and/or password");
    }
  } catch (err) {
    console.log(err);
  }
  // Our login logic ends here
};

// Add category logic
async function addCategory(req, res) {
  try {
    const newCategory = req.body.name;

    // use updateOne() to update groceries collection 
    const updateGrocery = await Grocery.updateOne(
      {
        _id: req.body.grocery
      },
      {
        $push: {
          categories: req.body.name 
        },
      }
    );
    
    return res.status(200).send(newCategory);
  } 
  catch (error) {
    console.log(error);
    res.status(500).send(error);
  }
};

// Add item logic
async function addItem(req, res) {
  try {
    const newItem = await addNewItem(req.body);

    // use updateOne() to update groceries collection 
    const updateGrocery = await Grocery.updateOne(
      {
        _id: newItem.grocery
      },
      {
        $push: {
          items: newItem._id
        }
      }
    );

    return res.status(200).send(newItem);
  } 
  catch (error) {
    console.log(error);
    res.status(500).send(error);
  }
};

// Remove item logic
async function removeItem(req, res) {
  try {
    const item = await Item.findOne({ _id: req.query.id });
    if (!item) console.log(404);

    const deleteResult = await item.remove();

    await Grocery.updateOne(
      { _id: req.body.grocery },
      { $pull: { items: item._id } }
    );

    return res.send("Item removed successfully");
  } catch (error) {
    console.log(error);
  }
};

// Update item logic
async function updateItem(req, res) {
  try {
    const item = await Item.findByIdAndUpdate( { _id: req.query.id } ,{
      $set: {
        name: req.body.name,
        price: req.body.price,
        quantity: req.body.quantity,
        picture: req.body.picture,
        category: req.body.category,
      },
    });
    
    return res.send("Item Successfully Updated");
  } catch (error) {
    console.log(error);
  }
};

// Update grocery account logic
async function updateAccount(req, res) {
  try {
    const grocery = await Grocery.findByIdAndUpdate( { _id: req.query.id } ,{
      $set: {
        name: req.body.name,
        phone_number: req.body.phone_number,
        description: req.body.description,
        location: req.body.location,
        picture: req.body.picture,
      },
    });
    
    return res.send("Account Successfully Updated");
  } catch (error) {
    console.log(error);
  }
};

// View grocery stock logic
async function viewStock(req, res) {
  try {
    if (req.query.id) {
      const id = req.query.id;
      const result = await getGroceryStock(id);
      return res.send(result);
    }
  } catch (error) {
    console.log(error);
  }
};

// View item from stock logic
async function viewItem(req, res) {
  try {
    if (req.query.id) {
      const id = req.query.id;
      const result = await getGroceryItem(id);
      return res.send(result);
    }
  } catch (error) {
    console.log(error);
  }
};

// Manage order logic
async function manageOrder(req, res) {
  try {
    if (req.query.id) {
      const id = req.query.id;
      const result = await getOrder(id);
      return res.send(result);
    }
  } catch (error) {
    console.log(error);
  }
};

// View order element logic
async function viewOrderElement(req, res) {
  try {
    if (req.query.id) {
      const id = req.query.id;
      const result = await getOrderElement(id);
      return res.send(result);
    }
  } catch (error) {
    console.log(error);
  }
};

module.exports = {
  register,
  login,
  addCategory,
  addItem,
  removeItem,
  updateItem,
  updateAccount,
  viewStock,
  viewItem,
  manageOrder,
  viewOrderElement,
};