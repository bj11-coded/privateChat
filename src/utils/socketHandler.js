import messageModel from "../schema/message.schems.js";
import userModel from "../schema/user.schems.js";


export const socketSetup = async(io) =>{
    io.on("connection",(socket) =>{
        console.log("User Connected", socket.id)

        // client disconnection
        socket.on("disconnect",() =>{
            console.log("User Disconnected", socket.id)
        })

        // send message:

        socket.on("message:send",async(data) =>{
            try {
                const{ message, reciver} = data;

                const newMessage = new messageModel({
                    sender:socket.userId,
                    reciver,
                    message,
                    seen:false
                })
                await newMessage.save();

                await messageModel.populate('sender','username profilePicture isOnline')
                await messageModel.populate('reciver','username profilePicture isOnline')

                const messageData = newMessage;

                // private message
                io.to(reciver).emit("message:reciver", messageData);
                socket.emit("message:sender",messageData);
                
            } catch (error) {
                console.log(error)
                socket.emit("error",{message:"Failed to send message"})
            }
        })

        // start typing indicator
        socket.on("typing:start",(data) =>{
                const { reciver } = data;
                io.to(reciver).emit("typing:start",{reciver})  
        })

        // stop typing indicator
        socket.on("typing:stop",(data) =>{
            const {reciver} = data;
            io.to(reciver).emit("typing:stop",{reciver})
        })

    })

}


