import { io } from "socket.io-client";

let socketInstance = null;

export const getSocket = () => {
  if (!socketInstance) {
    socketInstance = io(
      import.meta.env.VITE_API_BASE_URL || "http://localhost:3000",
      {
        withCredentials: true,
        transports: ["websocket"],
        autoConnect: false, // IMPORTANT: manual control
      }
    );

    console.log("Frontend: Socket initialized");

    socketInstance.on("connect", () => {
      console.log("Frontend: Socket connected:", socketInstance.id);
    });

    socketInstance.on("disconnect", (reason) => {
      console.log("Frontend: Socket disconnected:", reason);
    });

    socketInstance.on("connect_error", (error) => {
      console.error("Frontend: Socket connection error:", error.message);
    });
  }

  return socketInstance;
};

export const connectSocket = () => {
  const socket = getSocket();
  if (!socket.connected) {
    socket.connect();
  }
};

export const authenticateSocket = (userId) => {
  const socket = getSocket();

  if (!userId) return;

  // Ensure connection first
  if (!socket.connected) {
    socket.connect();
  }

  socket.on("connect", () => {
    socket.emit("authenticate", userId);
    console.log("Frontend: Socket authenticated for user:", userId);
  });

  // If already connected
  if (socket.connected) {
    socket.emit("authenticate", userId);
    console.log("Frontend: Socket authenticated immediately:", userId);
  }
};

export const disconnectSocket = () => {
  if (socketInstance) {
    socketInstance.disconnect();
    socketInstance = null;
    console.log("Frontend: Socket disconnected manually");
  }
};