import express from "express";
import dotenv from "dotenv";
import UserRoutes from "./src/routers/user.routes.js";
import mongooseDB from "./src/config/db.js";
import sessionMiddleware from "./src/middleware/session.js";

// config the socketio
import { Server } from "socket.io";
import http from "http";
import { socketSetup } from "./src/utils/socketHandler.js";

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

app.use("/api/users", UserRoutes);

app.use("/", (req, res) => {
  res.send("Hello World....");
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
