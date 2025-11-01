"use client";

import React, { createContext, useState, useContext } from "react";

export const ChatContext = createContext();

const ChatProvider = ({ children }) => {
  const [chats, setChats] = useState([]);
  const [selectedChat, setSelectedChat] = useState(null);
  const [notifications, setNotifications] = useState([]);

  return (
    <ChatContext.Provider
      value={{
        chats,
        setChats,
        selectedChat,
        setSelectedChat,
        notifications,
        setNotifications,
      }}
    >
      {children}
    </ChatContext.Provider>
  );
};

export const useChatState = () => useContext(ChatContext);

export default ChatProvider;
