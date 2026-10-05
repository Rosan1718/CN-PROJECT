import { create } from "zustand";
import { persist } from "zustand/middleware";

import { axiosInstance } from "../lib/axios";
import { useAuthStore } from "./useAuthStore";
import toast from "react-hot-toast";

function showBrowserMessageNotification(title, body) {
  if (typeof document === "undefined" || document.visibilityState !== "hidden") return;
  if (typeof Notification === "undefined" || Notification.permission !== "granted") return;

  const notification = new Notification(title, { body, icon: "/favicon.svg" });
  notification.onclick = () => window.focus();
}

export const useChatStore = create(
  persist(
    (set, get) => ({
      users: [],
      conversations: [],
      groups: [],
      messages: [],
      selectedUser: null,
      isConversationsLoading: false,
      isUsersLoading: false,
      isMessagesLoading: false,
      activeConversationId: null,
      searchQuery: "",
      sidebarTab: "chats",
      composerText: "",
      isSoundEnabled: true,
      isNotificationsEnabled:
        typeof Notification !== "undefined" && Notification.permission === "granted",
      isSendingMedia: false,

      getUsers: async () => {
        set({ isUsersLoading: true });
        try {
          const res = await axiosInstance.get("/messages/users");
          set((state) => ({
            users: res.data,
            selectedUser:
              state.selectedUser && res.data.some((user) => user._id === state.selectedUser._id)
                ? state.selectedUser
                : null,
          }));
        } catch (error) {
          console.log("Error in get Users", error.message);
        } finally {
          set({ isUsersLoading: false });
        }
      },

      getConversations: async () => {
        set({ isConversationsLoading: true });
        try {
          const res = await axiosInstance.get("/messages/conversations");
          set({ conversations: res.data });
        } catch (error) {
          console.log("Error in getConversations", error.message);
        } finally {
          set({ isConversationsLoading: false });
        }
      },

      getGroups: async () => {
        try {
          const res = await axiosInstance.get("/messages/groups");
          set({ groups: res.data });
        } catch (error) {
          console.log("Error in getGroups", error.message);
        }
      },

      createGroup: async ({ name, members }) => {
        try {
          const res = await axiosInstance.post("/messages/groups", { name, members });
          set((state) => ({ groups: [res.data, ...state.groups] }));
          get().setActiveConversationId(`group:${res.data._id}`);
          get().getConversations();
          return true;
        } catch (error) {
          toast.error(error.response?.data?.message || "Could not create group");
          return false;
        }
      },

      sendInvitation: async (emailAddress) => {
        try {
          await axiosInstance.post("/auth/invite", { emailAddress });
          toast.success("Invitation email sent.");
          return true;
        } catch (error) {
          toast.error(error.response?.data?.message || "Could not send the invitation.");
          return false;
        }
      },

      enableBrowserNotifications: async () => {
        if (typeof Notification === "undefined") {
          toast.error("This browser does not support desktop notifications.");
          return;
        }

        const permission = await Notification.requestPermission();
        set({ isNotificationsEnabled: permission === "granted" });
        if (permission === "granted") toast.success("Desktop notifications enabled.");
        else toast.error("Allow notifications for localhost in your browser settings.");
      },

      getMessages: async (userId) => {
        if (!userId) return;
        set({ isMessagesLoading: true });
        try {
          const res = await axiosInstance.get(`/messages/${userId}`);
          set({ messages: res.data });
        } catch (error) {
          toast.error(error.response?.data?.message || "Failed to load messages");
        } finally {
          set({ isMessagesLoading: false });
        }
      },

      getGroupMessages: async (groupId) => {
        if (!groupId) return;
        set({ isMessagesLoading: true });
        try {
          const res = await axiosInstance.get(`/messages/groups/${groupId}/messages`);
          set({ messages: res.data });
        } catch (error) {
          toast.error(error.response?.data?.message || "Failed to load group messages");
        } finally {
          set({ isMessagesLoading: false });
        }
      },

      sendMessage: async (messageData) => {
        const { selectedUser, messages } = get();
        if (!selectedUser) return false;

        try {
          const url = selectedUser.isGroup
            ? `/messages/groups/${selectedUser._id}/messages`
            : `/messages/send/${selectedUser._id}`;
          const res = await axiosInstance.post(url, messageData);
          set({ messages: [...messages, res.data], composerText: "" });
          get().getConversations();
          get().getGroups();
          return true;
        } catch (error) {
          toast.error(error.response?.data?.message || "Failed to send message");
          return false;
        }
      },

      subscribeToMessages: () => {
        const socket = useAuthStore.getState().socket;
        if (!socket) return;

        socket.off("newMessage");
        socket.on("newMessage", (newMessage) => {
          const state = get();
          const isOpen = state.activeConversationId === String(newMessage.senderId);
          if (isOpen) {
            set({ messages: [...state.messages, newMessage] });
          } else {
            const sender = [...state.users, ...state.conversations].find(
              (user) => String(user._id) === String(newMessage.senderId),
            );
            const senderName = sender?.fullName || "Someone";
            const preview = newMessage.text || (newMessage.image ? "Sent a photo" : "Sent a video");
            toast(`${senderName}: ${preview}`);
          }
          showBrowserMessageNotification("New message", newMessage.text || "You received an attachment.");
          get().getConversations();
        });
        socket.on("newGroupMessage", (newMessage) => {
          const groupConversationId = `group:${newMessage.groupId}`;
          const state = get();
          const isOpen = state.activeConversationId === groupConversationId;
          if (isOpen) {
            set({ messages: [...state.messages, newMessage] });
          } else {
            const group = state.groups.find((item) => String(item._id) === String(newMessage.groupId));
            const senderName = newMessage.sender?.fullName || "Someone";
            const preview = newMessage.text || (newMessage.image ? "Sent a photo" : "Sent a video");
            toast(`${group?.name || "Group chat"} · ${senderName}: ${preview}`);
          }
          showBrowserMessageNotification(
            newMessage.sender?.fullName || "New group message",
            newMessage.text || "You received an attachment.",
          );
          get().getGroups();
        });
      },

      unsubscribeFromMessages: () => {
        const socket = useAuthStore.getState().socket;
        socket?.off("newMessage");
        socket?.off("newGroupMessage");
      },

      setSelectedUser: (selectedUser) => set({ selectedUser }),

      setActiveConversationId: (activeConversationId) => {
        set((state) => ({
          activeConversationId,
          selectedUser: activeConversationId?.startsWith("group:")
            ? { ...state.groups.find((group) => group._id === activeConversationId.slice(6)), isGroup: true }
            : state.users.find((user) => user._id === activeConversationId) ||
              state.conversations.find((user) => user._id === activeConversationId) || null,
          messages: activeConversationId ? state.messages : [],
        }));
      },

      setSearchQuery: (searchQuery) => set({ searchQuery }),
      setSidebarTab: (sidebarTab) => set({ sidebarTab }),
      setComposerText: (composerText) => set({ composerText }),
      setSoundEnabled: (isSoundEnabled) => set({ isSoundEnabled }),

      sendTextMessage: async (conversationId) => {
        const messageText = get().composerText.trim();
        if (!conversationId || !messageText) return false;

        return get().sendMessage({ text: messageText });
      },

      sendMediaMessage: async ({ conversationId, file }) => {
        if (!conversationId || !file) return false;

        const formData = new FormData();
        formData.append("media", file);

        set({ isSendingMedia: true });
        try {
          return await get().sendMessage(formData);
        } finally {
          set({ isSendingMedia: false });
        }
      },
    }),
    {
      name: "imessage-storage",
      partialize: (state) => ({ isSoundEnabled: state.isSoundEnabled }),
    },
  ),
);
