const express = require('express');
const http = require('http');
const socketIO = require('socket.io');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const axios = require('axios'); 

// Load environment variables
dotenv.config();

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

// Define Mongoose schemas and models
const userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  status: { type: String, enum: ['AVAILABLE', 'BUSY'], default: 'AVAILABLE' },
});

const messageSchema = new mongoose.Schema({
  sender: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  recipient: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  content: { type: String, required: true },
  timestamp: { type: Date, default: Date.now },
});

const User = mongoose.model('User', userSchema);
const Message = mongoose.model('Message', messageSchema);

// Create the Express app
const app = express();

//const io = socketIO(server);

// Middleware
app.use(express.json());
//const cors = require('cors');

const corsOptions = {
  origin: 'http://localhost:3000', 
  credentials: true, // access-control-allow-credentials:true
  optionSuccessStatus:200,
  methods: 'POST, PUT, PATCH, GET, DELETE, OPTIONS'
};

// Initialize Socket.IO server with CORS options
app.use(cors(corsOptions));
const server = http.createServer(app);
const io = socketIO(server, {
  cors: corsOptions
});

//app.use(cors());


// User registration route
app.post('/register', async (req, res) => {
  const { email, password } = req.body;

  try {
    // Check if the user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ error: 'User already exists' });
    }

    // Hash the password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create a new user
    const newUser = new User({ email, password: hashedPassword });
    await newUser.save();

    res.status(201).json({ message: 'User registered successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// User login route
app.post('/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    // Check if the user exists
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ error: 'Invalid credentials' });
    }

    // Compare the provided password with the hashed password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(400).json({ error: 'Invalid credentials' });
    }

    // Generate and return a JWT
    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET);
    
    console.log('user id '+ user._id );
    temp=user._id;
    temp=temp.toString();
   // console.log('user id '+ temp );

    res.json({ token ,temp });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Update user status route
app.put('/status', authenticateToken, async (req, res) => {
  const { status } = req.body;
  const userId = req.userId;
  console.log('testing status api '+status);

  try {
    // Update the user's status
    await User.findByIdAndUpdate(userId, { status });
    res.json({ message: 'User status updated successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Send message route
app.post('/messages', authenticateToken, async (req, res) => {
  const { recipient, content } = req.body;
  const senderId = req.userId;

  try {
    // Find the recipient user
    const recipientUser = await User.findById(recipient);

    if (!recipientUser) {
      return res.status(400).json({ error: 'Recipient user not found' });
    }

    // If the recipient is busy, generate an LLM response
    if (recipientUser.status === 'BUSY') {
      const llmResponse = await getLLMResponse(content);
      const message = new Message({
        sender: senderId,
        recipient,
        content: llmResponse,
      });
      await message.save();
      return res.json({ message });
    }

    // Create a new message
    const message = new Message({
      sender: senderId,
      recipient,
      content,
    });
    await message.save();

    // Emit message to recipient if they are connected
    const recipientSocket = connectedUsers.get(recipient);
    if (recipientSocket) {
      recipientSocket.emit('message', message);
    }

    res.json({ message });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});



// Retrieve messages route
app.get('/messages/:recipientId', authenticateToken, async (req, res) => {
  const senderId = req.userId;
  const recipientId = req.params.recipientId;

  try {
    // Find messages between the sender and recipient
    const messages = await Message.find({
      $or: [
        { sender: senderId, recipient: recipientId },
        { sender: recipientId, recipient: senderId },
      ],
    }).sort({ timestamp: 1 });

    res.json(messages);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Authentication middleware
function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Access denied. No token provided.' });
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (err) {
      return res.status(403).json({ error: 'Invalid token' });
    }

    req.userId = decoded.userId;
    next();
  });
}

// LLM Integration
async function getLLMResponse(prompt) {
  try {
    const response = await axios.post(
      'https://api.example.com/llm',
      { prompt },
      {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${process.env.LLM_API_KEY}`,
        },
        timeout: 10000, // 10 seconds timeout
      }
    );

    return response.data.result;
  } catch (err) {
    console.error('Failed to get LLM response:', err);
    return 'I am currently unavailable. Please try again later.';
  }
}
const connectedUsers=new Map();
// Socket.io connection
io.on('connection', (socket) => {
  console.log('A user connected');

  // Join the user's room
  socket.on('join', (userId) => {
    console.log(`User ${userId} joined`);
    connectedUsers.set(userId, socket); // Store socket instance with userId as the key
  });

  // Disconnect event
  socket.on('disconnect', () => {
    console.log('A user disconnected');
    // Remove user from connectedUsers map when they disconnect
    connectedUsers.forEach((value, key) => {
      if (value === socket) {
        connectedUsers.delete(key);
      }
    });
  });
});



// Start the server
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});