import React, { useCallback, useContext, useEffect, useState ,createContext } from "react";
import { io, Socket } from "socket.io-client";

const SocketContext = createContext(null);

export const useSocket = () => {
  const state = useContext(SocketContext);
  if (!state) throw new Error(`state is undefined`);

  return state;
};

export const SocketProvider = ({ children }) => {
  const [socket, setSocket] = useState();
  const [messages, setMessages] = useState([]);

  const sendMessage = useCallback(
    (msg) => {
    //   console.log("Send Message", msg);
      if (socket) {
        socket.emit("event", { message: msg });
      }
    },
    [socket]
  );

  const onMessageRec = useCallback((msg) => {
    console.log("From Server Msg Rec", msg);
    const { message } = msg;
    setMessages((prev) => [...prev, message]);
  }, []);

  useEffect(() => {
    const _socket = io(`${process.env.CHAT_SERVER_URL}`);
    _socket.on("message", onMessageRec);

    setSocket(_socket);

    return () => {
        _socket.disconnect();
        _socket.off("message", onMessageRec);
      setSocket(undefined);
    };
  }, [onMessageRec]);

  return (
    <SocketContext.Provider value={{ sendMessage, messages , socket}}>
      {children}
    </SocketContext.Provider>
  );
};