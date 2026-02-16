import sessionMiddleware from "./session.js";

export const socketAuthMiddleware = (io) => {
  // Share session middleware with Socket.IO
  io.use((socket, next) => {
    const req = socket.request;
    const res = socket.request.res || {};
    sessionMiddleware(req, res, (err) => {
      if (err) {
        return next(err);
      }
      next();
    });
  });

  // Authenticate and set userId
  io.use((socket, next) => {
    if (socket.request.session && socket.request.session.userId) {
      socket.userId = socket.request.session.userId;
      console.log(`Socket authenticated for user: ${socket.userId}`);
      next();
    } else {
      console.log("Socket authentication failed: No session or userId");
      next(new Error("Authentication error"));
    }
  });
};
