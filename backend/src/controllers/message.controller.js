import User from "../models/user.model.js";
import Message from "../models/message.model.js";
import { hasImageKitConfig, uploadChatMedia } from "../lib/imagekit.js";
import { emitToUser } from "../lib/socket.js";
import Group from "../models/group.model.js";

export async function getUsersForSidebar(req, res) {
  try {
    const loggedInUserId = req.user._id;

    const filteredUsers = await User.find({ _id: { $ne: loggedInUserId } }).select("-clerkId");

    res.status(200).json(filteredUsers);
  } catch (error) {
    console.error("Error in getUsersForSidebar:", error.message);
    res.status(500).json({ message: "Internal server error" });
  }
}

export async function getConversationsForSidebar(req, res) {
  try {
    const loggedInUserId = req.user._id;

    const conversations = await Message.aggregate([
      // 1. Keep only the messages I sent or received.
      {
        $match: {
          groupId: { $exists: false },
          $or: [{ senderId: loggedInUserId }, { receiverId: loggedInUserId }],
        },
      },
      // 2. Collapse them into one row per chat partner, noting our latest message time.
      {
        $group: {
          // The partner is the other person on the message (not me).
          _id: { $cond: [{ $eq: ["$senderId", loggedInUserId] }, "$receiverId", "$senderId"] },
          lastMessageAt: { $max: "$createdAt" },
        },
      },
      // 3. Put the most recent conversation at the top.
      { $sort: { lastMessageAt: -1 } },
      // 4. Look up each partner's user profile (comes back as an array).
      { $lookup: { from: "users", localField: "_id", foreignField: "_id", as: "user" } },
      // 5. Pull that profile out of the array and make it the document.
      { $replaceRoot: { newRoot: { $first: "$user" } } },
      // 6. Hide the private clerkId field from the result.
      { $project: { clerkId: 0 } },
    ]);

    res.status(200).json(conversations);
  } catch (error) {
    console.error("Error in getConversationsForSidebar:", error.message);
    res.status(500).json({ message: "Internal server error" });
  }
}

export async function getMessages(req, res) {
  try {
    const { id: userToChatId } = req.params;
    const myId = req.user._id;

    const messages = await Message.find({
      $or: [
        { senderId: myId, receiverId: userToChatId },
        { senderId: userToChatId, receiverId: myId },
      ],
    }).sort({ createdAt: 1 });

    res.status(200).json(messages);
  } catch (error) {
    console.error("Error in getMessages:", error.message);
    res.status(500).json({ message: "Internal server error" });
  }
}

export async function sendMessage(req, res) {
  try {
    const { text } = req.body;
    const { id: receiverId } = req.params;
    const senderId = req.user._id;

    let imageUrl;
    let videoUrl;

    if (req.file) {
      if (!hasImageKitConfig()) {
        return res.status(500).json({ message: "Media upload is not configured" });
      }

      const url = await uploadChatMedia(req.file);
      if (req.file.mimetype.startsWith("video/")) videoUrl = url;
      else imageUrl = url;
    }

    const newMessage = new Message({
      senderId,
      receiverId,
      text,
      image: imageUrl,
      video: videoUrl,
    });

    await newMessage.save();

    emitToUser(receiverId, "newMessage", newMessage);

    res.status(201).json(newMessage);
  } catch (error) {
    console.error("Error in sendMessage:", error.message);
    res.status(500).json({ message: "Internal server error" });
  }
}

export async function getGroupMessages(req, res) {
  try {
    const group = await Group.findOne({ _id: req.params.id, members: req.user._id });
    if (!group) return res.status(404).json({ message: "Group not found" });
    const messages = await Message.find({ groupId: group._id }).sort({ createdAt: 1 });
    res.status(200).json(messages);
  } catch (error) {
    console.error("Error in getGroupMessages:", error.message);
    res.status(500).json({ message: "Internal server error" });
  }
}

export async function sendGroupMessage(req, res) {
  try {
    const group = await Group.findOne({ _id: req.params.id, members: req.user._id });
    if (!group) return res.status(404).json({ message: "Group not found" });

    const { text } = req.body;
    let image;
    let video;
    if (req.file) {
      if (!hasImageKitConfig()) return res.status(500).json({ message: "Media upload is not configured" });
      const url = await uploadChatMedia(req.file);
      if (req.file.mimetype.startsWith("video/")) video = url;
      else image = url;
    }
    if (!text?.trim() && !image && !video) return res.status(400).json({ message: "Message cannot be empty" });

    const message = await Message.create({ senderId: req.user._id, groupId: group._id, text, image, video });
    await Group.updateOne({ _id: group._id }, { $set: { updatedAt: new Date() } });
    const payload = { ...message.toObject(), sender: { _id: req.user._id, fullName: req.user.fullName } };
    for (const memberId of group.members) {
      if (String(memberId) !== String(req.user._id)) emitToUser(memberId, "newGroupMessage", payload);
    }
    res.status(201).json(payload);
  } catch (error) {
    console.error("Error in sendGroupMessage:", error.message);
    res.status(500).json({ message: "Internal server error" });
  }
}

export async function getGroups(req, res) {
  try {
    const groups = await Group.find({ members: req.user._id })
      .populate("members", "fullName profilePic")
      .sort({ updatedAt: -1 });
    res.status(200).json(groups);
  } catch (error) {
    console.error("Error in getGroups:", error.message);
    res.status(500).json({ message: "Internal server error" });
  }
}

export async function createGroup(req, res) {
  try {
    const name = String(req.body.name || "").trim();
    const requestedMembers = Array.isArray(req.body.members) ? req.body.members : [];
    if (!name || name.length > 60) return res.status(400).json({ message: "Enter a group name (up to 60 characters)" });
    const memberIds = [...new Set([...requestedMembers.map(String), String(req.user._id)])];
    if (memberIds.length < 3) return res.status(400).json({ message: "Choose at least two people" });
    const validMembers = await User.find({ _id: { $in: memberIds } }).select("_id");
    if (validMembers.length !== memberIds.length) return res.status(400).json({ message: "One or more people could not be found" });
    const group = await Group.create({ name, members: memberIds, createdBy: req.user._id });
    const populated = await Group.findById(group._id).populate("members", "fullName profilePic");
    res.status(201).json(populated);
  } catch (error) {
    console.error("Error in createGroup:", error.message);
    res.status(500).json({ message: "Internal server error" });
  }
}
