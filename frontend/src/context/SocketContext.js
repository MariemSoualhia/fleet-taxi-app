import { createContext, useContext, useEffect, useRef, useState } from "react";
import { io } from "socket.io-client";
import { useAuth } from "./AuthContext"; // ou le nom de ton context auth

const SocketContext = createContext();

export const SocketProvider = ({ children }) => {
  const { user } = useAuth(); // dépend de ta logique auth

  const socket = useRef(null);
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [incomingMessage, setIncomingMessage] = useState(null);

  useEffect(() => {
    if (user?.id) {
      socket.current = io("http://localhost:5000"); // à adapter si déployé
      socket.current.emit("addUser", user.id);

      socket.current.on("getOnlineUsers", (users) => {
        setOnlineUsers(users);
      });

      socket.current.on("receiveMessage", (data) => {
        setIncomingMessage(data);
      });
    }

    return () => {
      socket.current?.disconnect();
    };
  }, [user]);

  const sendMessage = (messageData) => {
    socket.current?.emit("sendMessage", messageData);
  };

  return (
    <SocketContext.Provider
      value={{
        socket: socket.current,
        onlineUsers,
        sendMessage,
        incomingMessage,
      }}
    >
      {children}
    </SocketContext.Provider>
  );
};

export const useSocket = () => useContext(SocketContext);
