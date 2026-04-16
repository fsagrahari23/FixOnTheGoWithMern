import { io } from "socket.io-client";

let socketInstance = null;

const SOCKET_BASE_URL =
  import.meta.env.VITE_API_BASE_URL ||
  import.meta.env.VITE_API_URL ||
  "http://localhost:3000";

export const getSocket = () => {
  if (!socketInstance) {
    socketInstance = io(SOCKET_BASE_URL, {
      withCredentials: true,
      transports: ["websocket", "polling"],
      autoConnect: true,
    });
    console.log("Frontend: Socket initialized");
    
    socketInstance.on("connect", () => {
      console.log("Frontend: Socket connected", socketInstance.id);
    });
    
    socketInstance.on("connect_error", (error) => {
      console.error("Frontend: Socket connection error", error);
    });
  }
  return socketInstance;
};

export const authenticateSocket = (userId) => {
  const socket = getSocket();
  if (socket && socket.connected && userId) {
    socket.emit("authenticate", userId);
    console.log("Frontend: Socket authenticated for user", userId);
  }
};

export const disconnectSocket = () => {
  if (socketInstance) {
    socketInstance.disconnect();
    socketInstance = null;
  }
};
