import { create } from "zustand";
import { axiosInstance } from "../lib/axios";
import { io } from "socket.io-client";

const BASE_URL =
  import.meta.env.VITE_SOCKET_URL ||
  import.meta.env.VITE_API_URL?.replace(/\/api\/?$/, "") ||
  (import.meta.env.MODE === "development" ? "http://localhost:5000" : window.location.origin);

export const useAuthStore = create((set, get) => ({
  authUser: null,
  isCheckingAuth: true,
  onlineUsers: [],
  socket: null,

  checkAuth: async (getToken) => {
    set({ isCheckingAuth: true });

    try {
      const res = await axiosInstance.get("/auth/check");
      set({ authUser: res.data });

      get().connectSocket(res.data, getToken);
    } catch (error) {
      console.error("Error in checkAuth:", error);
      set({ authUser: null });
    } finally {
      set({ isCheckingAuth: false });
    }
  },

  clearAuth: () => {
    set({ authUser: null, isCheckingAuth: false, onlineUsers: [] });
    get().disconnectSocket();
  },

  connectSocket: (user, getToken) => {
    if (!user || get().socket) return;

    const socket = io(BASE_URL, {
      auth: (callback) => {
        getToken?.().then((token) => callback({ token })).catch(() => callback({ token: null }));
      },
    });

    set({ socket });

    socket.on("getOnlineUsers", (userIds) => {
      set({ onlineUsers: userIds });
    });

    socket.on("connect_error", (error) => {
      console.error("Chat connection failed:", error.message);
    });
  },

  disconnectSocket: () => {
    const socket = get().socket;
    socket?.disconnect();
    set({ socket: null });
  },
}));
