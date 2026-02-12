# Private Chat Application

A beautiful, real-time chat application built with modern web technologies, featuring a stunning glassmorphism UI, Socket.IO for real-time messaging, and MongoDB for data persistence.

![Chat App](https://img.shields.io/badge/Status-Ready-success)
![Version](https://img.shields.io/badge/Version-1.0.0-blue)
![Node](https://img.shields.io/badge/Node-18+-green)

---

## Table of Contents

- [Features](#-features)
- [Getting Started](#-getting-started)
- [**Step-by-Step Tutorial**](#-step-by-step-tutorial-build-from-scratch) ⭐
- [Project Structure](#-project-structure)
- [How to Use](#-how-to-use)
- [API Endpoints](#-api-endpoints)
- [Socket.IO Events](#-socketio-events)
- [Technologies Used](#️-technologies-used)
- [Troubleshooting](#-troubleshooting)

---

## Features

### **Beautiful Modern UI**

- Glassmorphism design with gradient backgrounds
- Smooth animations and transitions
- Responsive layout for all devices
- Custom scrollbars and hover effects
- Professional color scheme with Inter font

### **Real-time Messaging**

- Instant message delivery via Socket.IO
- Message bubbles with timestamps
- Sent/received message differentiation
- Auto-scroll to latest messages
- Message history persistence

### **User Management**

- User registration and authentication
- Session-based login system
- Online/offline status indicators
- User search functionality
- Profile pictures (auto-generated avatars)

### **Typing Indicators**

- Real-time typing status
- Automatic timeout after 1 second
- Visual feedback in chat header

### **Security**

- Password hashing with bcrypt
- Session management with express-session
- MongoDB session store
- Secure authentication flow

---

## Getting Started

### Prerequisites

- Node.js 18+ installed
- MongoDB Atlas account or local MongoDB
- Modern web browser

### Quick Start

1. **Navigate to the project**

   ```bash
   cd /Users/bijaychaudahry/Desktop/chatApplication
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Configure `.env` file**

   ```env
   PORT=4001
   MONGO_URL=your_mongodb_connection_string
   JWT_SECRET=your_jwt_secret
   SESSION_SECRET=your_session_secret
   ```

4. **Start the server**

   ```bash
   npm run dev
   ```

5. **Open the application**
   Navigate to: `http://localhost:4001`

---

# Step-by-Step Tutorial: Build from Scratch

This comprehensive guide will teach you how to build a real-time chat application using Socket.IO, MongoDB, Express Sessions, and modern web technologies.

---

## Tutorial Overview

**What You'll Learn:**

- Setting up a Node.js project with Express
- Configuring MongoDB with Mongoose
- Implementing user authentication with sessions
- Building real-time features with Socket.IO
- Creating a beautiful frontend with modern CSS
- Handling security and validation

**Time Required:** 2-3 hours  
**Difficulty Level:** Intermediate

---

## Phase 1: Project Setup & Configuration

### Step 1: Initialize the Project

```bash
# Create project directory
mkdir chatApplication
cd chatApplication

# Initialize npm project
npm init -y
```

**Explanation:** This creates a new Node.js project with a `package.json` file that tracks dependencies.

---

### Step 2: Install Dependencies

```bash
# Core dependencies
npm install express mongoose dotenv

# Socket.IO for real-time communication
npm install socket.io

# Authentication & Security
npm install bcryptjs express-session connect-mongo

# Development dependency
npm install --save-dev nodemon
```

**What each package does:**

- **express**: Web framework for building the server
- **mongoose**: MongoDB object modeling tool
- **dotenv**: Loads environment variables from `.env` file
- **socket.io**: Enables real-time bidirectional communication
- **bcryptjs**: Hashes passwords securely
- **express-session**: Manages user sessions
- **connect-mongo**: Stores sessions in MongoDB
- **nodemon**: Auto-restarts server on file changes (dev only)

---

### Step 3: Configure package.json

Update your `package.json`:

```json
{
  "name": "chatapplication",
  "version": "1.0.0",
  "type": "module",
  "scripts": {
    "start": "node index.js",
    "dev": "nodemon index.js"
  },
  "dependencies": {
    "bcryptjs": "^3.0.3",
    "connect-mongo": "^6.0.0",
    "dotenv": "^17.2.4",
    "express": "^5.2.1",
    "express-session": "^1.19.0",
    "mongoose": "^9.2.0",
    "socket.io": "^4.8.3"
  },
  "devDependencies": {
    "nodemon": "^3.1.11"
  }
}
```

**Key Points:**

- `"type": "module"` enables ES6 import/export syntax
- Scripts allow running `npm run dev` for development

---

### Step 4: Create Environment Variables

Create a `.env` file in the root directory:

```env
PORT=4001
MONGO_URL=mongodb+srv://username:password@cluster.mongodb.net/chatapp
JWT_SECRET=your_super_secret_jwt_key_here
SESSION_SECRET=your_super_secret_session_key_here
```

**Security Note:** Never commit `.env` to version control! Add it to `.gitignore`.

---

## Phase 2: Database Setup

### Step 5: Create MongoDB Connection

Create `src/config/db.js`:

```javascript
import mongoose from "mongoose";
import dotenv from "dotenv";
dotenv.config();

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URL);
    console.log("MongoDB connected");
  } catch (error) {
    console.log("MongoDB connection error:", error);
    process.exit(1); // Exit if database connection fails
  }
};

export default connectDB;
```

**Explanation:**

- Connects to MongoDB using the connection string from `.env`
- Uses async/await for asynchronous database connection
- Exits the process if connection fails

---

### Step 6: Create User Schema

Create `src/schema/user.schems.js`:

```javascript
import mongoose from "mongoose";

// Array of default profile pictures
let profilePicture = [
  "https://i.pinimg.com/1200x/e0/8a/b6/e08ab6833ad182a9fc7f26bc11cd8921.jpg",
  "https://i.pinimg.com/736x/99/3a/53/993a53a25bb6733c99f5f57106065019.jpg",
  "https://i.pinimg.com/1200x/9a/58/90/9a5890424f91f737b395417b7eb6ef9c.jpg",
  "https://i.pinimg.com/736x/7b/5f/8e/7b5f8ed9099f56185933e42549ef1115.jpg",
  "https://i.pinimg.com/1200x/0e/71/c3/0e71c36795c37f092c6a1716b6e263a4.jpg",
];

const userSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: true,
      unique: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
      required: true,
    },
    profilePicture: {
      type: String,
      default:
        profilePicture[Math.floor(Math.random() * profilePicture.length)],
    },
    isOnline: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true },
); // Adds createdAt and updatedAt automatically

const User = mongoose.model("User", userSchema);

export default User;
```

**Key Concepts:**

- **Schema**: Defines the structure of documents in MongoDB
- **Validation**: `required: true` ensures fields must be provided
- **Unique**: Prevents duplicate usernames/emails
- **Default values**: Auto-assigns random profile picture
- **Timestamps**: Automatically tracks creation and update times

---

### Step 7: Create Message Schema

Create `src/schema/message.schems.js`:

```javascript
import mongoose from "mongoose";

const messageSchema = new mongoose.Schema(
  {
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User", // References the User model
      required: true,
    },
    reciver: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    message: {
      type: String,
      required: true,
    },
    seen: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true },
);

const Message = mongoose.model("Message", messageSchema);
export default Message;
```

**Key Concepts:**

- **ObjectId**: MongoDB's unique identifier for documents
- **ref**: Creates a relationship between Message and User models
- **populate()**: Later used to fetch full user details instead of just IDs

---

## Phase 3: Session Management

### Step 8: Configure Express Session

Create `src/middleware/session.js`:

```javascript
import session from "express-session";
import dotenv from "dotenv";
import MongoStore from "connect-mongo";
dotenv.config();

const sessionMiddleware = session({
  secret: process.env.SESSION_SECRET, // Used to sign the session ID cookie
  resave: false, // Don't save session if unmodified
  saveUninitialized: false, // Don't create session until something stored
  store: MongoStore.create({
    mongoUrl: process.env.MONGO_URL,
    collectionName: "sessions", // Collection name in MongoDB
    touchAfter: 24 * 60 * 60, // Lazy session update (24 hours)
  }),
  cookie: {
    maxAge: 1000 * 60 * 60 * 24, // 24 hours in milliseconds
    httpOnly: true, // Prevents client-side JS from reading the cookie
    secure: false, // Set to true in production with HTTPS
    sameSite: "lax", // CSRF protection
  },
});

export default sessionMiddleware;
```

**Session Concepts:**

- **Session**: Stores user data on the server, identified by a cookie
- **MongoStore**: Persists sessions in MongoDB (survives server restarts)
- **httpOnly**: Security feature preventing XSS attacks
- **maxAge**: Session expires after 24 hours

---

### Step 9: Create Authentication Middleware

Create `src/middleware/auth.js`:

```javascript
export const checkAuth = (req, res, next) => {
  if (req.session.userId) {
    next(); // User is authenticated, proceed
  } else {
    res.status(401).json({
      message: "Unauthorized user",
      success: false,
    });
  }
};
```

**Middleware Concept:**

- Runs before route handlers
- Checks if user is logged in by verifying session
- Protects routes that require authentication

---

## Phase 4: Authentication Controllers

### Step 10: Create Authentication Controller

Create `src/controllers/auth.controller.js`:

```javascript
import userSchema from "../schema/user.schems.js";
import bcrypt from "bcryptjs";

// REGISTER USER
export const RegisterUser = async (req, res) => {
  try {
    const { username, email, password } = req.body;

    // Validation
    if (!username || !email || !password) {
      return res.status(400).json({
        message: "All Fields are required",
        success: false,
      });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashpassword = bcrypt.hashSync(password, salt);

    // Create new user
    const newUser = new userSchema({
      username,
      email,
      password: hashpassword,
    });

    await newUser.save();

    res.status(201).json({
      message: "User created successfully",
      success: true,
      user: newUser,
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
      success: false,
    });
  }
};

// LOGIN USER
export const LoginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validation
    if (!email || !password) {
      return res.status(400).json({
        message: "All Fields are required",
        success: false,
      });
    }

    // Find user
    const user = await userSchema.findOne({ email });

    if (!user) {
      return res.status(400).json({
        message: "User not found",
        success: false,
      });
    }

    // Verify password
    const ispasswordValid = bcrypt.compareSync(password, user.password);

    if (!ispasswordValid) {
      return res.status(400).json({
        message: "Invalid password",
        success: false,
      });
    }

    // Create session
    req.session.userId = user._id;
    user.isOnline = true;
    await user.save();

    res.status(200).json({
      message: "User logged in successfully",
      success: true,
      user: {
        _id: user._id,
        username: user.username,
        email: user.email,
        isOnline: user.isOnline,
      },
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
      success: false,
    });
  }
};

// LOGOUT USER
export const LogoutUser = async (req, res) => {
  try {
    if (req.session.userId) {
      // Update user status
      await userSchema.findByIdAndUpdate(req.session.userId, {
        isOnline: false,
      });

      // Destroy session
      req.session.destroy();

      res.status(200).json({
        message: "User logged out successfully",
        success: true,
      });
    }
  } catch (error) {
    res.status(500).json({
      message: error.message,
      success: false,
    });
  }
};
```

**Security Best Practices:**

1. **Password Hashing**: Never store plain text passwords
2. **bcrypt**: Industry-standard hashing algorithm
3. **Salt**: Adds randomness to prevent rainbow table attacks
4. **Validation**: Always validate input before processing
5. **Return statements**: Prevent code execution after sending response

---

## Phase 5: Message Controller

### Step 11: Create Message Controller

Create `src/controllers/message.controller.js`:

```javascript
import messageModel from "../schema/message.schems.js";

export const getMessage = async (req, res) => {
  try {
    const { id } = req.params; // Other user's ID
    const sender = req.session.userId; // Current user's ID

    // Find all messages between these two users
    const message = await messageModel
      .find({
        $or: [
          { sender: sender, reciver: id },
          { sender: id, reciver: sender },
        ],
      })
      .populate("sender", "username profilePicture isOnline")
      .populate("reciver", "username profilePicture isOnline")
      .sort({ createdAt: 1 }); // Sort by oldest first

    res.status(200).json({
      message: "Message Fetched Successfully",
      success: true,
      data: message,
    });
  } catch (err) {
    res.status(500).json({
      message: err.message || "Internal server error",
      success: false,
    });
  }
};
```

**MongoDB Query Concepts:**

- **$or**: Finds messages where sender→receiver OR receiver→sender
- **populate()**: Replaces user IDs with actual user documents
- **sort()**: Orders messages chronologically

---

## Phase 6: Socket.IO Implementation

### Step 12: Create Socket Handler

Create `src/utils/socketHandler.js`:

```javascript
import messageModel from "../schema/message.schems.js";

export const socketSetup = async (io) => {
  io.on("connection", (socket) => {
    console.log("User Connected", socket.id);

    // Handle disconnection
    socket.on("disconnect", () => {
      console.log("User Disconnected", socket.id);
    });

    // Handle sending messages
    socket.on("message:send", async (data) => {
      try {
        const { message, reciver } = data;

        // Create new message in database
        const newMessage = new messageModel({
          sender: socket.userId,
          reciver,
          message,
          seen: false,
        });

        await newMessage.save();

        // Populate sender and receiver details
        await newMessage.populate("sender", "username profilePicture isOnline");
        await newMessage.populate(
          "reciver",
          "username profilePicture isOnline",
        );

        const messageData = newMessage;

        // Send to receiver
        io.to(reciver).emit("message:reciver", messageData);

        // Send confirmation to sender
        socket.emit("message:sender", messageData);
      } catch (error) {
        console.log(error);
        socket.emit("error", { message: "Failed to send message" });
      }
    });

    // Handle typing indicators
    socket.on("typing:start", (data) => {
      const { reciver } = data;
      io.to(reciver).emit("typing:start", { reciver });
    });

    socket.on("typing:stop", (data) => {
      const { reciver } = data;
      io.to(reciver).emit("typing:stop", { reciver });
    });
  });
};
```

**Socket.IO Concepts:**

- **connection**: Fired when a client connects
- **disconnect**: Fired when a client disconnects
- **emit()**: Sends event to specific client
- **io.to()**: Sends event to specific room/user
- **on()**: Listens for events from clients

---

## Phase 7: Routes Setup

### Step 13: Create Routes

Create `src/routers/user.routes.js`:

```javascript
import express from "express";
import {
  deleteUser,
  getAllUsers,
  getById,
  updateUser,
} from "../controllers/user.controller.js";
import {
  RegisterUser,
  LoginUser,
  LogoutUser,
} from "../controllers/auth.controller.js";
import { getMessage } from "../controllers/message.controller.js";

const router = express.Router();

// User routes
router.get("/", getAllUsers);
router.get("/:id", getById);
router.put("/edit/:id", updateUser);
router.delete("/delete/:id", deleteUser);

// Authentication routes
router.post("/register", RegisterUser);
router.post("/login", LoginUser);
router.post("/logout", LogoutUser);

// Message routes
router.get("/messages/:id", getMessage);

export default router;
```

**REST API Principles:**

- **GET**: Retrieve data
- **POST**: Create new data
- **PUT**: Update existing data
- **DELETE**: Remove data

---

## Phase 8: Server Setup

### Step 14: Create Main Server File

Create `index.js` in the root directory:

```javascript
import express from "express";
import dotenv from "dotenv";
import UserRoutes from "./src/routers/user.routes.js";
import mongooseDB from "./src/config/db.js";
import sessionMiddleware from "./src/middleware/session.js";

// Socket.IO setup
import { Server } from "socket.io";
import http from "http";
import { socketSetup } from "./src/utils/socketHandler.js";

dotenv.config();

const app = express();
const server = http.createServer(app); // Create HTTP server

// Initialize Socket.IO
const io = new Server(server, {
  cors: {
    origin: "*", // Allow all origins (restrict in production)
    methods: ["GET", "POST"],
    credentials: true,
  },
});

// Setup Socket.IO handlers
socketSetup(io);

const PORT = process.env.PORT || 3000;

// Connect to MongoDB
mongooseDB();

// Middleware
app.use(sessionMiddleware);
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));

// Serve static files from view folder
app.use(express.static("view"));

// API Routes
app.use("/api/users", UserRoutes);

// Root route
app.use("/", (req, res) => {
  res.send("Hello World....");
});

// Start server (use server, not app, for Socket.IO)
server.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
```

**Critical Points:**

- Use `server.listen()` not `app.listen()` for Socket.IO to work
- `http.createServer(app)` wraps Express app for WebSocket support
- Middleware order matters: session before routes
- CORS configuration allows cross-origin requests

---

## Phase 9: Frontend Development

### Step 15: Create HTML Structure

Create `view/index.html`:

```html
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Private Chat - Real-time Messaging</title>
    <link rel="stylesheet" href="styles.css" />
    <link
      href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap"
      rel="stylesheet"
    />
    <script src="https://cdn.socket.io/4.8.0/socket.io.min.js"></script>
  </head>
  <body>
    <!-- Authentication Screen -->
    <div id="auth-screen" class="auth-screen">
      <!-- Login/Register forms go here -->
    </div>

    <!-- Chat Screen -->
    <div id="chat-screen" class="chat-screen" style="display: none;">
      <!-- Sidebar with user list -->
      <div class="sidebar">
        <!-- User list goes here -->
      </div>

      <!-- Chat Area -->
      <div class="chat-area">
        <!-- Messages and input go here -->
      </div>
    </div>

    <script src="app.js"></script>
  </body>
</html>
```

**HTML Best Practices:**

- Semantic structure
- External CSS and JS files
- CDN for Socket.IO client
- Google Fonts for typography

---

### Step 16: Create CSS Styling

Create `view/styles.css` with modern design:

```css
:root {
  --primary-gradient: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  --primary-color: #667eea;
  --bg-color: #f5f7fb;
  --card-bg: rgba(255, 255, 255, 0.95);
  --text-primary: #2d3748;
  --shadow-lg: 0 10px 40px rgba(0, 0, 0, 0.12);
}

body {
  font-family: "Inter", sans-serif;
  background: var(--bg-color);
  margin: 0;
  padding: 0;
}

/* Glassmorphism effect */
.auth-container {
  background: var(--card-bg);
  backdrop-filter: blur(10px);
  border-radius: 1rem;
  box-shadow: var(--shadow-lg);
}

/* Message bubbles */
.message.sent .message-bubble {
  background: var(--primary-gradient);
  color: white;
}

.message.received .message-bubble {
  background: #f7fafc;
  color: var(--text-primary);
}
```

**CSS Techniques:**

- CSS Variables for consistent theming
- Glassmorphism with `backdrop-filter`
- Flexbox for layouts
- Smooth animations with `transition`

---

### Step 17: Create JavaScript Logic

Create `view/app.js`:

```javascript
// Global state
let socket = null;
let currentUser = null;
let selectedUser = null;

const API_BASE = "http://localhost:4001/api";
const SOCKET_URL = "http://localhost:4001";

// Initialize Socket.IO
function initializeSocket() {
  socket = io(SOCKET_URL, {
    transports: ["websocket", "polling"],
  });

  socket.on("connect", () => {
    console.log("Connected:", socket.id);
    socket.userId = currentUser._id;
  });

  socket.on("message:reciver", (data) => {
    handleIncomingMessage(data);
  });

  socket.on("typing:start", (data) => {
    showTypingIndicator();
  });
}

// Send message
function sendMessage() {
  const input = document.getElementById("message-input");
  const message = input.value.trim();

  if (!message || !selectedUser) return;

  socket.emit("message:send", {
    reciver: selectedUser._id,
    message: message,
  });

  input.value = "";
}

// Handle incoming messages
function handleIncomingMessage(data) {
  if (selectedUser && data.sender._id === selectedUser._id) {
    messages.push(data);
    renderMessages();
  }
}
```

**JavaScript Concepts:**

- Event-driven architecture
- Async/await for API calls
- DOM manipulation
- Real-time event handling

---

## Phase 10: Testing & Deployment

### Step 18: Test the Application

```bash
# Start the server
npm run dev

# Open browser
open http://localhost:4001

# Test checklist:
# Register new user
# Login with credentials
# Send messages
# Receive messages in real-time
# Typing indicators work
# Online status updates
```

---

### Step 19: Common Issues & Solutions

**Issue 1: Socket.IO not connecting**

```javascript
// Solution: Make sure you're using server.listen(), not app.listen()
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
```

**Issue 2: Sessions not persisting**

```javascript
// Solution: Ensure MongoStore is configured correctly
store: MongoStore.create({
  mongoUrl: process.env.MONGO_URL,
  collectionName: "sessions",
});
```

**Issue 3: Messages not populating user data**

```javascript
// Solution: Use populate() on the document instance, not the model
await newMessage.populate("sender", "username profilePicture");
```

---

## Key Concepts Explained

### 1. **How Socket.IO Works**

```
Client                          Server
  |                               |
  |--- socket.connect() --------->|
  |<-- connection event ----------|
  |                               |
  |--- emit('message:send') ----->|
  |                               |--- Save to DB
  |                               |--- emit to receiver
  |<-- emit('message:sender') ----|
```

### 2. **Session Flow**

```
1. User logs in
2. Server creates session with unique ID
3. Session ID stored in cookie
4. Cookie sent with every request
5. Server validates session
6. User stays logged in until session expires
```

### 3. **Message Flow**

```
1. User types message
2. Click send button
3. Socket.IO emits 'message:send' event
4. Server receives event
5. Server saves message to MongoDB
6. Server emits to receiver's socket
7. Both users see message instantly
```

---

## Security Best Practices

### 1. **Password Security**

```javascript
// Always hash passwords
const salt = await bcrypt.genSalt(10);
const hashedPassword = bcrypt.hashSync(password, salt);

// Never log passwords
console.log(password); //  NEVER DO THIS
```

### 2. **Session Security**

```javascript
cookie: {
    httpOnly: true,    // Prevents XSS attacks
    secure: true,      // HTTPS only (production)
    sameSite: 'strict' // CSRF protection
}
```

### 3. **Input Validation**

```javascript
// Always validate and sanitize input
if (!username || !email || !password) {
  return res.status(400).json({ message: "Invalid input" });
}

// Escape HTML to prevent XSS
function escapeHtml(text) {
  const div = document.createElement("div");
  div.textContent = text;
  return div.innerHTML;
}
```

---

## 🚀 Performance Optimization

### 1. **Database Indexing**

```javascript
// Add indexes for faster queries
userSchema.index({ email: 1 });
messageSchema.index({ sender: 1, reciver: 1 });
```

### 2. **Pagination**

```javascript
// Load messages in batches
const messages = await messageModel
  .find({
    /* query */
  })
  .limit(50)
  .skip(page * 50);
```

### 3. **Connection Pooling**

```javascript
// MongoDB automatically pools connections
mongoose.connect(MONGO_URL, {
  maxPoolSize: 10,
});
```

---

## Additional Resources

### Documentation

- [Socket.IO Docs](https://socket.io/docs/)
- [Express.js Guide](https://expressjs.com/)
- [Mongoose Docs](https://mongoosejs.com/)
- [MongoDB Manual](https://docs.mongodb.com/)

### Tutorials

- [MDN Web Docs](https://developer.mozilla.org/)
- [Node.js Best Practices](https://github.com/goldbergyoni/nodebestpractices)

---

## What You've Learned

**Backend Development**

- Express.js server setup
- RESTful API design
- MongoDB database modeling
- Session management
- Real-time communication with Socket.IO

**Frontend Development**

- Modern HTML5 structure
- CSS3 animations and glassmorphism
- JavaScript event handling
- DOM manipulation
- WebSocket client implementation

**Security**

- Password hashing with bcrypt
- Session-based authentication
- Input validation
- XSS and CSRF protection

**Best Practices**

- Code organization
- Error handling
- Async/await patterns
- Environment variables
- Git workflow

---

## Congratulations!

You've successfully built a full-stack real-time chat application! You now understand:

- How to structure a Node.js application
- How to implement real-time features
- How to secure user authentication
- How to work with MongoDB
- How to create a beautiful frontend

**Next Steps:**

- Add file sharing
- Implement group chats
- Add video calling
- Deploy to production
- Build a mobile app

---

## Project Structure

```
chatApplication/
├── view/                          # Frontend files
│   ├── index.html                # Main HTML structure
│   ├── styles.css                # Beautiful CSS styling
│   └── app.js                    # Client-side JavaScript
├── src/
│   ├── config/
│   │   └── db.js                 # MongoDB connection
│   ├── controllers/
│   │   ├── auth.controller.js    # Authentication logic
│   │   ├── message.controller.js # Message handling
│   │   └── user.controller.js    # User management
│   ├── middleware/
│   │   ├── auth.js               # Auth middleware
│   │   └── session.js            # Session configuration
│   ├── routers/
│   │   └── user.routes.js        # API routes
│   ├── schema/
│   │   ├── message.schems.js     # Message model
│   │   └── user.schems.js        # User model
│   └── utils/
│       └── socketHandler.js      # Socket.IO logic
├── index.js                       # Server entry point
├── package.json                   # Dependencies
├── .env                          # Environment variables
└── .gitignore                    # Git ignore file
```

---

## How to Use

### 1. **Create an Account**

- Click "Sign Up" on the login screen
- Enter username, email, and password
- Click "Sign Up" to create your account

### 2. **Login**

- Enter your email and password
- Click "Sign In"
- You'll be redirected to the chat screen

### 3. **Start Chatting**

- Select a user from the sidebar
- Type your message in the input field
- Press Enter or click the send button
- Messages appear in real-time!

---

## API Endpoints

### Authentication

- `POST /api/users/register` - Register a new user
- `POST /api/users/login` - Login user
- `POST /api/users/logout` - Logout user

### Users

- `GET /api/users/` - Get all users
- `GET /api/users/:id` - Get user by ID
- `PUT /api/users/edit/:id` - Update user
- `DELETE /api/users/delete/:id` - Delete user

### Messages

- `GET /api/users/messages/:id` - Get messages with a specific user

---

## Socket.IO Events

### Client → Server

- `message:send` - Send a message
- `typing:start` - Start typing indicator
- `typing:stop` - Stop typing indicator

### Server → Client

- `message:reciver` - Receive a message
- `message:sender` - Confirmation of sent message
- `typing:start` - User started typing
- `typing:stop` - User stopped typing
- `error` - Error occurred

---

## Technologies Used

### Backend

- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **Socket.IO** - Real-time communication
- **MongoDB** - Database
- **Mongoose** - ODM for MongoDB
- **bcryptjs** - Password hashing
- **express-session** - Session management
- **connect-mongo** - MongoDB session store

### Frontend

- **HTML5** - Structure
- **CSS3** - Styling (Glassmorphism, animations)
- **Vanilla JavaScript** - Client-side logic
- **Socket.IO Client** - Real-time messaging
- **Google Fonts** - Typography (Inter)

---

## Troubleshooting

### Server won't start

- Check if port 4001 is available
- Verify MongoDB connection string in `.env`
- Run `npm install` to ensure all dependencies are installed

### Can't connect to Socket.IO

- Ensure server is running on port 4001
- Check browser console for errors
- Verify firewall settings

### Messages not sending

- Check if you're logged in
- Verify Socket.IO connection status
- Check server logs for errors

---

## License

This project is open source and available for educational purposes.

---

**Access the app at:** `http://localhost:4001`

_Last Updated: February 12, 2026_
