import messageModel from "../schema/message.schems.js";
import userSchema from "../schema/user.schems.js";

export const getMessage = async (req, res) => {
  try {
    const { id } = req.params;
    const sender = req.session.userId;

    const message = await messageModel
      .find({
        $or: [
          { sender: sender, reciver: id },
          { sender: id, reciver: sender },
        ],
      })
      .populate("sender")
      .populate("reciver");

    res.status(200).json({
      message: "Message Fetched Successfully",
      success: true,
      data: message.reverse(),
    });
  } catch (err) {
    res.status(500).json({
      message: err.message || "Internal server error",
      success: false,
    });
  }
};

export const getOnlineUser = async (req, res) => {
  try {
    const onlineUser = await userSchema
      .find({ isOnline: true })
      .select("username profilePicture isOnline");

    if (!onlineUser) {
      res.status(404).json({
        message: "No online users found",
        success: false,
      });
    }

    res.status(200).json({
      message: "Online users fetched successfully",
      success: true,
      data: onlineUser,
    });
  } catch (error) {
    res.status(500).json({
      message: error.message || "Internal server error",
      success: false,
    });
  }
};
