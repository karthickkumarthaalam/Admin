import { useEffect } from "react";
import { io } from "socket.io-client";

export const socket = io(process.env.REACT_APP_SOCKET_URL, {
  withCredentials: true,
  transports: ["websocket"],
});

export const useSocket = (onNotification) => {
  useEffect(() => {
    socket.on("new-notification", (data) => {
      onNotification && onNotification(data);
    });

    return () => {
      socket.off("new-notification");
    };
  }, [onNotification]);
};
