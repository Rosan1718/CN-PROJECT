import { useMediaQuery } from "./useMediaQuery";
import { formatMessageTime } from "../lib/utils";
import { useChatStore } from "../store/useChatStore";
import { useAuthStore } from "../store/useAuthStore";

// John Doe -> JD
export function getInitials(name) {
  return name
    .split(" ")
    .filter(Boolean)
    .map((namePart) => namePart[0])
    .join("");
}

// mapUserToConversation is an adapter — it converts the raw backend shapes (a user document + an array of message documents) into the clean view-model that the chat UI components expect to render.

// Two transformations happen:
// 1. Messages → UI messages
// 2. User → peer

function mapUserToConversation({ user, messages, authUser, onlineUsers, isGroup = false }) {
  const mappedMessages = messages.map((message) => ({
    id: message._id,
    role: String(message.senderId) === String(authUser?._id) ? "me" : "them",
    senderName: message.sender?.fullName || user.members?.find((member) => String(member._id) === String(message.senderId))?.fullName,
    text: message.text || "",
    time: formatMessageTime(message.createdAt),
    imageUrl: message.image,
    videoUrl: message.video,
  }));

  return {
    id: user._id,
    isGroup,
    peer: {
      name: isGroup ? user.name : user.fullName,
      subtitle: isGroup ? `${user.members.length} members` : user.email,
      isOnline: isGroup ? false : onlineUsers.includes(user._id),
      avatarUrl: user.profilePic,
      initials: getInitials(isGroup ? user.name : user.fullName),
    },
    messages: mappedMessages,
  };
}

export function useSelectedConversation() {
  const activeConversationId = useChatStore((state) => state.activeConversationId);
  const conversations = useChatStore((state) => state.conversations);
  const groups = useChatStore((state) => state.groups);
  const users = useChatStore((state) => state.users);
  const messages = useChatStore((state) => state.messages);

  const authUser = useAuthStore((state) => state.authUser);
  const onlineUsers = useAuthStore((state) => state.onlineUsers);

  const isLargeScreen = useMediaQuery("(min-width: 1024px)");

  const isGroup = activeConversationId?.startsWith("group:");
  const selectedUser = activeConversationId
    ? isGroup
      ? groups.find((group) => group._id === activeConversationId.slice(6))
      : users.find((user) => user._id === activeConversationId) ||
        conversations.find((user) => user._id === activeConversationId)
    : null;

  const activeConversation = selectedUser
    ? mapUserToConversation({ user: selectedUser, messages, authUser, onlineUsers, isGroup })
    : null;

  return {
    activeConversation,
    activeConversationId,
    isGroup,
    isLargeScreen,
  };
}
