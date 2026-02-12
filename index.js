import express from "express";
import dotenv from "dotenv";
import UserRoutes from "./src/routers/user.routes.js";
import mongooseDB from "./src/config/db.js";
import sessionMiddleware from "./src/middleware/session.js";
import MessageRoutes from "./src/routers/message.routes.js";

// config the socketio
import { Server } from "socket.io";
import http from "http";
import { socketSetup } from "./src/utils/socketHandler.js";

import path from "path";
import { fileURLToPath } from "url";
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config();

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
    credentials: true,
  },
});
socketSetup(io);

const PORT = process.env.PORT || 3000;

mongooseDB();
app.use(sessionMiddleware);
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));

// Serve static files from view folder
app.use(express.static("view"));

app.use("/users", UserRoutes);
app.use("/messages", MessageRoutes);

app.use("/", (req, res) => {
  res.sendFile(path.join(__dirname, "view", "index.html"));
});

server.listen(PORT, () => {
  console.log(`Server is running on port http://localhost:${PORT}`);
});
