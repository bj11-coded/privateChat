import session from "express-session";
import dotenv from "dotenv";
import MongoStore from "connect-mongo";
dotenv.config();

const sessionMiddleware = session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  store: MongoStore.create({
    mongoUrl: process.env.MONGO_URL,
    collectionName: "sessions",
    touchAfter: 24 * 60 * 60, // lazy updates
  }),
  cookie: {
    maxAge: 1000 * 60 * 60 * 24,
    httpOnly: true,
    secure: false,
    sameSite: "lax",
  },
});

export default sessionMiddleware;
