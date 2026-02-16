import messageModel from "../schema/message.schems.js";
import userModel from "../schema/user.schems.js";

export const socketSetup = async (io) => {
  io.on("connection", (socket) => {
    console.log("User Connected", socket.id, "User ID:", socket.userId);

    // Join user's personal room for private messaging
    if (socket.userId) {
      socket.join(socket.userId.toString());
      console.log(`User ${socket.userId} joined their personal room`);
    }

    // client disconnection
    socket.on("disconnect", () => {
      console.log("User Disconnected", socket.id, "User ID:", socket.userId);
    });

    // send message:

    socket.on("message:send", async (data) => {
      try {
        const { message, reciver } = data;

        const newMessage = new messageModel({
          sender: socket.userId,
          reciver,
          message,
          seen: false,
        });
        await newMessage.save();

        await newMessage.populate("sender", "username profilePicture isOnline");
        await newMessage.populate(
          "reciver",
          "username profilePicture isOnline",
        );

        const messageData = newMessage;

        // private message - emit to receiver's room
        io.to(reciver.toString()).emit("message:reciver", messageData);
        socket.emit("message:sender", messageData);
      } catch (error) {
        console.log(error);
        socket.emit("error", { message: "Failed to send message" });
      }
    });

    // start typing indicator
    socket.on("typing:start", (data) => {
      const { reciver } = data;
      io.to(reciver.toString()).emit("typing:start", { sender: socket.userId });
    });

    // stop typing indicator
    socket.on("typing:stop", (data) => {
      const { reciver } = data;
      io.to(reciver.toString()).emit("typing:stop", { sender: socket.userId });
    });
  });
};
