const { getUsers, getById, getByEmail, getGroceryById, getCategoryById, getCategories, getGroceryStock } = require('../service');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const auth = require("../../../middleware/auth");

// Importing user context
const User = require("../../../model/user");
const Grocery = require('../../../model/grocery');

// Register logic
async function register (req, res) {

  try {
    // Get user input
    const { first_name, last_name, email, password, gender, location, profile_picture } = req.body;

    // Validate user input
    if (!(email && password && first_name && last_name && gender && location && profile_picture)) {
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
      location,
      profile_picture,
    });

    // Create token
    const token = jwt.sign(
      { user_id: user._id, email },
      process.env.TOKEN_KEY,
      {
        expiresIn: "2h",
      }
    );
    // Save user token
    user.token = token;

    // Return new user
    res.status(201).json(user);
  } catch (err) {
    console.log(err);
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
        {
          expiresIn: "2h",
        }
      );

      // Save user token
      user.token = token;

      // Return user
      res.status(200).json(user);
    }
    res.status(400).send("Invalid Credentials - Wrong email and/or password");
  } catch (err) {
    console.log(err);
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
    console.log(error);
  }
};

// View category(ies) logic
async function viewCategories(req, res) {
  try {
    if (req.query.id) {
      const id = req.query.id;
      const result = await getCategoryById(id);
      return res.send(result);
    }

    const result = await getCategories();

    return res.send(result);
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

//Function to get all users
async function get(req, res) {
  try {

    if (req.query.id) {
      const id = req.query.id;
      const result = await getById(id);
      // console.log('result of specific user =>', result);
      return res.send(result);
    }
    
    //Get specific user reffering to his email
    //To be corrected (if no such email in db it is returning [])
    if (req.query.email) {
      const user = await getByEmail(req.query.email);
      // console.log(user)
      return res.send(user);
    }

    const result = await getUsers();
    // console.log('result =>', result);

    return res.send(result);
  } catch (error) {
    console.log(error);
  }
}

//Authenticating the user
async function authUser (req, res) {
  res.status(200).send("Welcome 🙌 ");
};

module.exports = {
    register,
    login,
    get,
    authUser,
    viewGroceries,
    viewCategories,
    viewStock,
};