const { getUsers, getById, getByEmail, getGroceryById, getGroceryItem, addOrder, getOrder } = require('../service');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// Importing user context
const User = require("../../../model/user");
const Grocery = require('../../../model/grocery');
const Order = require('../../../model/order');

// Register logic
async function register (req, res) {

  try {
    // Get user input
    const { first_name, last_name, email, password, gender, profile_picture } = req.body;

    // Validate user input
    if (!(email && password && first_name && last_name && gender)) {
      res.status(400).send("All input are required");
    }

    // Validate if user exist in our database
    const oldUser = await User.findOne({ email });

    if (oldUser) {
      return res.status(409).send("User Already Exist. Please Login");
    }

    // Encrypt user password
    encryptedPassword = await bcrypt.hash(password, 10);

    // Create user in our database
    const user = await User.create({
      first_name,
      last_name,
      email: email.toLowerCase(), // Sanitize: convert email to lowercase
      password: encryptedPassword,
      user_type: 0,
      gender,
      profile_picture,
    });

    // Create token
    const token = jwt.sign(
      { user_id: user._id, email },
      process.env.TOKEN_KEY,
    );
    // Save user token
    user.token = token;

    // Return new user
    res.status(201).json(user);
  } catch (err) {
    res.status(500).json(error)
  }
  // Our register logic ends here
};

// Login logic
async function login (req, res) {

  try {
    // Get user input
    const { email, password } = req.body;

    // Validate user input
    if (!(email && password)) {
      res.status(400).send("All input is required");
    }

    email.toLowerCase()
    // Validate if user exist in our database
    const user = await User.findOne({ email });

    if (user && (await bcrypt.compare(password, user.password))) {
      // Create token
      const token = jwt.sign(
        { user_id: user._id, email },
        process.env.TOKEN_KEY,
      );

      // Save user token
      user.token = token;

      // Return user
      res.status(200).json(user);
    } else {
      res.status(400).send("Invalid Credentials - Wrong email and/or password");
    }
  } catch (err) {
    res.status(500).json(error)
  }
  // Our login logic ends here
};

// View grocery(ies) logic
async function viewGroceries(req, res) {
  try {
    if (req.query.id) {
      const id = req.query.id;
      const result = await getGroceryById(id);
      return res.send(result);
    }

    const result = await Grocery.find()
    
    return res.send(result);
  } catch (error) {
    res.status(500).json(error)
  }
};

// View grocery item logic
async function viewItem(req, res) {
  try {
    if (req.query.id) {
      const id = req.query.id;
      const result = await getGroceryItem(id);
      return res.send(result);
    }
  } catch (error) {
    res.status(500).json(error)
  }
};

// Update grocery profile logic
async function updateProfile(req, res) {
  try {
    const user = await User.findByIdAndUpdate( { _id: req.query.id } ,{
      $set: {
        first_name: req.body.first_name,
        last_name: req.body.last_name,
        profile_picture: req.body.profile_picture,
      },
    });
    
    return res.send({status: "200", message: "Profile Successfully Updated"});
  } catch (error) {
    res.status(500).json(error)
  }
};

// Review + rate grocery logic
async function reviewGrocery(req, res) {
  try {
    const request = req.body;
    const user_rating = request.rate;
    const user_raveiw = request.text;
    const user_id = request.user;
    const grocery = request.grocery;
    const first_name = request.first_name;

    // use updateOne() to update groceries collection 
    const updateGrocery = await Grocery.updateOne(
      {
        _id: grocery
      },
      {
        $push: {
          reviews: { 
            rate: user_rating, 
            text: user_raveiw, 
            first_name: first_name, 
            user: user_id 
          } 
        },
      }
    );

    return res.status(200).send("Review successfully added");
  } 
  catch (error) {
    res.status(500).json(error)
    res.status(500).send(error);
  }
};

// Create order logic
async function createOrder(req, res) {
  try {
    const order = await addOrder(req.body);

    // use updateOne() to update users collection
    const updateUser = await User.updateOne(
      {
        _id: order.user
      },
      {
        $push: {
          orders: order._id
        }
      }
    );

    // use updateOne() to update groceries collection 
    const updateGrocery = await Grocery.updateOne(
      {
        _id: order.grocery
      },
      {
        $push: {
          orders: order._id
        }
      }
    );

    return res.status(200).send(order);
  } 
  catch (error) {
    res.status(500).json(error)
    res.status(500).send(error);
  }
};

// Add element to order logic
async function addToOrder(req, res) {
  try {
    const request = req.body;
    const name = request.name;
    const price = request.price;
    const picture = request.picture;
    const quantity = request.quantity;
    const order = request.order;

    // use updateOne() to update orders collection
    const updateOrder = await Order.updateOne(
      {
        _id: order
      },
      {
        $push: {
          items: {
            name: name,
            price: price,
            picture: picture,
            quantity: quantity,
          }
        }
      }
    );
    
    return res.status(200).json({ status: "200",message:"Item added to your recent order"});
  } 
  catch (error) {
    res.status(500).json(error)
    res.status(500).send(error);
  }
};

// View cart logic
async function viewCart(req, res) {
  try {
    if (req.query.id) {
      const id = req.query.id;
      const result = await getOrder(id);
      return res.send(result);
    }
  } catch (error) {
    res.status(500).json(error)
  }
};

// Find nearby groceries logic
async function findNearbyGroceries(req, res){
  try {  
    const user = await User.findById(req.query.id);
    const userLatitude = req.body.latitude;
    const userLongitude = req.body.longitude;

    const groceries = await Grocery.find();

    const nearbyGroceries = groceries.filter((grocery) => {
      const groceryLatitude = grocery.latitude;
      const groceryLongitude = grocery.longitude;
      const distance = getDistanceFromLatLonInKm(
        userLatitude,
        userLongitude,
        groceryLatitude,
        groceryLongitude
      );
      return distance <= 25;
    }
    );
    return res.send(nearbyGroceries);
  }
  catch (error) {
    res.status(500).json(error)
  }
}

function getDistanceFromLatLonInKm(lat1, lon1, lat2, lon2) {
  var R = 6371; // Radius of the earth in km
  var dLat = degreesToRadians(lat2 - lat1); // deg to rad below
  var dLon = degreesToRadians(lon2 - lon1);
  var a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(degreesToRadians(lat1)) *
    Math.cos(degreesToRadians(lat2)) *
    Math.sin(dLon / 2) *
    Math.sin(dLon / 2);
  var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  var d = R * c; // Distance in km
  return d;
}

function degreesToRadians(degrees) {
  return degrees * Math.PI / 180;
}  
// End of nearby groceries logic

// Remove item from order logic
async function removeFromOrder(req, res) {
  try {
    const name = req.body.name;
    const price = req.body.price;
    const picture = req.body.picture;
    const order = req.body.order;

    // use updateOne() to update orders collection
    const updateOrder = await Order.updateOne(
      {
        _id: order
      },
      {
        $pull: { 
          items:{
            name: name,
            price: price,
            picture: picture
          }  
        }
      }
    );
    
    return res.status(200).json({ status: "200",message:"Item removed from your recent order"});
  } 
  catch (error) {
    res.status(500).json(error)
  }
};

module.exports = {
    register,
    login,
    viewGroceries,
    viewItem,
    updateProfile,
    reviewGrocery,
    createOrder,
    addToOrder,
    viewCart,
    findNearbyGroceries,
    removeFromOrder
};