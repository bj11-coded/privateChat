import express from "express";
import {
  getMessage,
  getOnlineUser,
} from "../controllers/message.controller.js";
import { checkAuth } from "../middleware/auth.js";

const router = express.Router();

// Specific routes MUST come before parameterized routes
router.get("/users/online", checkAuth, getOnlineUser);
router.get("/:id", checkAuth, getMessage);

export default router;
