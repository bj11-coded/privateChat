import userSchema from "../schema/user.schems.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

export const RegisterUser = async (req, res) => {
  try {
    const { username, email, password } = req.body;

    if ((!username, !email, !password)) {
      res.status(400).json({
        message: "All Fields are required",
        success: false,
      });
    }

    const salt = await bcrypt.genSalt(10);
    const hashpassword = bcrypt.hashSync(password, salt);

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

export const LoginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    if ((!email, !password)) {
      res.status(400).json({
        message: "All Fields are required",
        success: false,
      });
    }

    const user = await userSchema.findOne({ email });

    if (!user) {
      res.status(400).json({
        message: "User not found",
        success: false,
      });
    }

    const ispasswordValid = bcrypt.compareSync(password, user.password);

    if (!ispasswordValid) {
      res.status(400).json({
        message: "Invalid password",
        success: false,
      });
    }

    // const token = jwt.sign({ _id: user._id }, process.env.JWT_SECRET, {
    //   expiresIn: "1d",
    // });

    // set the session
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
        isOnline: user.isOnline
      },
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
      success: false,
    });
  }
};

export const LogoutUser = async (req, res) => {
  try {
    if (req.session.userId) {
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
