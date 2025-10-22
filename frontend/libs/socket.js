import { io } from "socket.io-client";

let socketInstance = null;

export const getSocket = () => {
  if (!socketInstance) {
    socketInstance = io("http://localhost:3001", {
      transports: ["websocket"],
      autoConnect: true,
    });
    console.log("Frontend: Socket initialized");
  }
  return socketInstance;
};
