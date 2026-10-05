import { useChatStore } from "../store/useChatStore";
import { useAuthStore } from "../store/useAuthStore";
import { useSelectedConversation } from "../hooks/useSelectedConversation";
import { useEffect } from "react";
import ChatSidebar from "../components/chat/ChatSidebar";
import { ChatHeader } from "../components/chat/ChatHeader";
import { MessageList } from "../components/chat/MessageList";
import { ChatComposer } from "../components/chat/ChatComposer";

function ChatPage() {
  const getConversations = useChatStore((state) => state.getConversations);
  const getMessages = useChatStore((state) => state.getMessages);
  const getUsers = useChatStore((state) => state.getUsers);
  const getGroups = useChatStore((state) => state.getGroups);
  const getGroupMessages = useChatStore((state) => state.getGroupMessages);
  const subscribeToMessages = useChatStore((state) => state.subscribeToMessages);
  const unsubscribeFromMessages = useChatStore((state) => state.unsubscribeFromMessages);
  const onlineUsers = useAuthStore((state) => state.onlineUsers);
  const onlineUsersKey = onlineUsers.slice().sort().join(",");

  const { activeConversation, activeConversationId, isLargeScreen } = useSelectedConversation();

  useEffect(() => {
    getUsers();
    getConversations();
    getGroups();
  }, [getConversations, getGroups, getUsers]);

  useEffect(() => {
    if (!onlineUsersKey) return;
    getUsers();
    getConversations();
    getGroups();
  }, [getConversations, getGroups, getUsers, onlineUsersKey]);

  useEffect(() => {
    subscribeToMessages();
    return () => unsubscribeFromMessages();
  }, [subscribeToMessages, unsubscribeFromMessages]);

  useEffect(() => {
    if (!activeConversationId) return;

    const groupId = activeConversationId.startsWith("group:") ? activeConversationId.slice(6) : null;
    if (groupId) getGroupMessages(groupId);
    else getMessages(activeConversationId);
  }, [getMessages, getGroupMessages, activeConversationId]);

  return (
    <div className="flex h-dvh flex-col overflow-hidden bg-background p-0 text-foreground sm:p-4 lg:p-7">
      <div className="mx-auto flex w-full max-w-7xl flex-1 overflow-hidden border border-border bg-background shadow-xl sm:rounded-2xl">
        <ChatSidebar />

        <div
          className={`flex-1 flex-col overflow-hidden ${
            !isLargeScreen && !activeConversationId ? "hidden lg:flex" : "flex"
          }`}
        >
          <ChatHeader />
          <MessageList />

          {activeConversation ? <ChatComposer /> : null}
        </div>
      </div>
    </div>
  );
}
export default ChatPage;
