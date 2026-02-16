import { io } from "socket.io-client";

let socketInstance = null;

export const getSocket = () => {
  if (!socketInstance) {
    socketInstance = io(import.meta.env.VITE_API_BASE_URL || "http://localhost:3001", {
      transports: ["websocket"],
      autoConnect: true,
    });
    console.log("Frontend: Socket initialized");
  }
  return socketInstance;
};
