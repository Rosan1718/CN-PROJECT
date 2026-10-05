import express from "express";
import {
  getConversationsForSidebar,
  getMessages,
  getUsersForSidebar,
  sendMessage,
  createGroup,
  getGroups,
  getGroupMessages,
  sendGroupMessage,
} from "../controllers/message.controller.js";
import { protectRoute } from "../middleware/auth.middleware.js";
import { upload } from "../middleware/upload.middleware.js";

const router = express.Router();

router.use(protectRoute);

router.get("/users", getUsersForSidebar);
router.get("/groups", getGroups);
router.post("/groups", createGroup);
router.get("/groups/:id/messages", getGroupMessages);
router.post("/groups/:id/messages", upload.single("media"), sendGroupMessage);
router.get("/conversations", getConversationsForSidebar);
router.get("/:id", getMessages);
router.post("/send/:id", upload.single("media"), sendMessage);

export default router;
