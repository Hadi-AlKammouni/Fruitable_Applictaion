const { addNewItem, getGroceryStock, getGroceryItem, getOrder, getGroceryById } = require('../service');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const Tesseract = require("tesseract.js") //To extract data from image for grocery registration

const Grocery = require("../../../model/grocery");
const Item = require("../../../model/item");
const Conversation = require("../../../model/conversation");
const Message = require("../../../model/message");

// Register grocery logic by OCR method
async function registerByOCR (req, res) {
  
  try {
    // Get grocery input by ocr 
    const { grocery_info, picture } = req.body;
    Tesseract.recognize(grocery_info, 'eng', { logger: e => console.log(e)})
    .then(async out => {
      const grocery_info = out.data.text.split("/")
      const name = grocery_info[1]
      const email = grocery_info[3]
      const password = grocery_info[5]
      const phone_number = grocery_info[7]
      const latitude = grocery_info[9]
      const longitude = grocery_info[11]
      const description = grocery_info[13]

      if (!(email && password && name &&  phone_number && latitude && longitude && description && picture)) {
        res.status(400).send("All input are required");
      }

      // Validate if grocery exist in our database
      const oldGrocery = await Grocery.findOne({ email });

      if (oldGrocery) {
        return res.status(409).json({ status: "409",message:"Email already exists."});
      }

      // Encrypt grocery password
      encryptedPassword = await bcrypt.hash(password, 10);

      // Create grocery in our database
      const grocery = await Grocery.create({
        name,
        email: email.toLowerCase(), // Sanitize: convert email to lowercase
        password: encryptedPassword,
        phone_number,
        latitude,
        longitude,
        description,
        picture,
      });
      
      // Create token
      const token = jwt.sign(
        { grocery_id: grocery._id, email },
        process.env.TOKEN_KEY,
      );
      // Save grocery token
      grocery.token = token;

      // Return new grocery
      res.status(201).json(grocery);
    })

  } catch (err) {
    res.status(500).json(error)
  }
  // Our registerOCR logic ends here
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
      );
      
      // Save grocery token
      grocery.token = token;
      
      // Return grocery
      res.status(200).json(grocery);
    }else{
      res.status(400).send("Invalid Credentials - Wrong email and/or password");
    }
  } catch (err) {
    res.status(500).json(error)
  }
  // Our login logic ends here
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

    return res.status(200).json({ status: "200",message:"Item has been removed successfully."});
  } catch (error) {
    res.status(500).json(error)
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
    return res.status(200).json({ status: "200",message:"Item updated successfully"});
  } catch (error) {
    res.status(500).json(error)
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
        latitude: req.body.latitude,
        longitude: req.body.longitude,
        picture: req.body.picture,
      },
    });
    
    return res.status(200).json({ status: "200",message:"Account successfully updated."});
  } catch (error) {
    res.status(500).json(error)
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
    res.status(500).json(error)
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
    res.status(500).json(error)
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
    res.status(500).json(error)
  }
};

// View grocery logic
async function viewGrocery(req, res) {
  try {
      const id = req.query.id;
      const result = await getGroceryById(id);
    return res.send(result);
  } catch (error) {
    res.status(500).json(error)
  }
};

// New conversation
async function newConversation (req,res) {
  const new_conversation = new Conversation({
    members: [req.body.senderId, req.body.receiverId]
  });
  try{
    const saved_conversation = await new_conversation.save();
    res.status(200).json(saved_conversation)
  }catch(error){
    res.status(500).json(error)
  }
}

// Get conversation of grocery
async function getConversation (req,res) {
  try {
    const id = req.query.id;
    const conversation = await Conversation.find({
      members: { $in: [id] }
    }) 
    res.status(200).json(conversation);
  } catch(error){
    res.status(500).json(error)
  }
}

// Add message
async function addMessage (req,res) {
  try {
    const new_message = new Message(req.body)
    const saved_message = await new_message.save()
    res.status(200).json(saved_message);
  } catch(error){
    res.status(500).json(error)
  }
}

// Get message
async function getMessage (req,res) {
  try {
    const id = req.query.id;
    const message = await Message.find({
      conversationId: id
    })
    res.status(200).json(message);
  } catch(error){
    res.status(500).json(error)
  }
}

module.exports = {
  registerByOCR,
  login,
  addItem,
  removeItem,
  updateItem,
  updateAccount,
  viewStock,
  viewItem,
  manageOrder,
  viewGrocery,
  newConversation,
  getConversation,
  addMessage,
  getMessage
};