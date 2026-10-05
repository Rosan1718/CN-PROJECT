import express from "express";
import http from "http";
import { Server } from "socket.io";
import { verifyToken } from "@clerk/express";
import User from "../models/user.model.js";
import { frontendCorsOrigin } from "./cors.js";

const app = express();
const server = http.createServer(app);

const io = new Server(server, { cors: { origin: frontendCorsOrigin, credentials: true } });

function emitToUser(userId, event, payload) {
  const socketIds = userSocketMap[String(userId)];
  if (socketIds?.size) io.to([...socketIds]).emit(event, payload);
}

const userSocketMap = Object.create(null);

io.use(async (socket, next) => {
  try {
    const token = socket.handshake.auth?.token;
    if (typeof token !== "string" || !token) return next(new Error("Unauthorized"));
    const claims = await verifyToken(token, { secretKey: process.env.CLERK_SECRET_KEY });
    if (!claims.sub) return next(new Error("Unauthorized"));
    const user = await User.findOne({ clerkId: claims.sub }).select("_id");
    if (!user) return next(new Error("Unauthorized"));
    socket.data.userId = String(user._id);
    next();
  } catch {
    next(new Error("Unauthorized"));
  }
});

io.on("connection", (socket) => {
  const userId = socket.data.userId;
  userSocketMap[userId] ||= new Set();
  userSocketMap[userId].add(socket.id);

  // io.emit() sends event to everyone - broadcast
  io.emit("getOnlineUsers", Object.keys(userSocketMap));

  // socket.on is used to listen for events
  socket.on("disconnect", () => {
    userSocketMap[userId]?.delete(socket.id);
    if (!userSocketMap[userId]?.size) delete userSocketMap[userId];
    io.emit("getOnlineUsers", Object.keys(userSocketMap));
  });
});

export { app, server, io, emitToUser };
