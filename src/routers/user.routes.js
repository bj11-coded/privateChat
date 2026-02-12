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

router.get("/", getAllUsers);
router.get("/:id", getById);
router.put("/edit/:id", updateUser);
router.delete("/delete/:id", deleteUser);

// auth
router.post("/register", RegisterUser);
router.post("/login", LoginUser);
router.post("/logout", LogoutUser);

// messages
router.get("/messages/:id", getMessage);

export default router;
