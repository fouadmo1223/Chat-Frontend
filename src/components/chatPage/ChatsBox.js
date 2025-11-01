"use client";

import { Box, Flex, Input, Button, HStack, Text } from "@chakra-ui/react";
import { useChatState } from "../../context/ChatContext";
import ChatBoxHeader from "./ChatBoxHeader";
import { useEffect, useState, useRef } from "react";
import ChatSpinner from "../spinners/ChatSpinner";
import { IoMdSend } from "react-icons/io";
import api from "../../api/axios";
import { useUser } from "../../context/UserContext";
import MessageCard from "../ui/MessageCard";
import { toaster } from "../ui/toaster";
import { io } from "socket.io-client";

var socket = null,
  selectedChatCompare = null;

const ChatsBox = ({ reloadChats, setReloadChats }) => {
  const { selectedChat, notifications, setNotifications } = useChatState();
  const { user } = useUser();
  const [allMessages, setAllMessages] = useState([]);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [newMessage, setNewMessage] = useState("");
  const [sending, setSending] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [typing, setTyping] = useState(false);
  const [typingUsers, setTypingUsers] = useState([]);
  const messagesEndRef = useRef(null);

  let typingTimeout;

  // Fetch messages
  const fetchMessages = async () => {
    if (!selectedChat) return;
    setLoadingMessages(true);
    try {
      const { data } = await api.get(`message/${selectedChat._id}`);
      setAllMessages(data.messages);
      socket.emit("join chat", selectedChat._id);

      // Emit read receipt after loading messages
      socket.emit("message read", {
        chatId: selectedChat._id,
        userId: user.id,
      });
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingMessages(false);
    }
  };

  // Send message
  const handleSendMessage = async () => {
    if (!newMessage.trim()) {
      toaster.create({
        title: "Message is empty",
        status: "error",
        duration: 3000,
        closable: true,
      });
      return;
    }
    setSending(true);
    try {
      const { data } = await api.post("message", {
        content: newMessage,
        chatId: selectedChat._id,
      });
      let sentMessage = data.message;
      setNewMessage("");
      setAllMessages((prev) => [...prev, sentMessage]);
      socket.emit("new message", sentMessage);

      // Emit read receipt for the sent message
      socket.emit("message read", {
        chatId: selectedChat._id,
        userId: user.id,
      });
    } catch (err) {
      toaster.create({
        title: "Message not sent",
        status: "error",
        duration: 3000,
        closable: true,
      });
      console.error(err);
    } finally {
      setSending(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleTyping = (e) => {
    setNewMessage(e.target.value);
    if (!socket || !selectedChat) return;

    if (!typing) {
      setTyping(true);
      socket.emit("typing", { room: selectedChat._id, user });
    }

    clearTimeout(typingTimeout);
    typingTimeout = setTimeout(() => {
      setTyping(false);
      socket.emit("stop typing", { room: selectedChat._id, user });
    }, 2000);
  };

  // Handle new messages
  const handleNewMessage = (newMessage) => {
    if (
      selectedChatCompare &&
      selectedChatCompare._id === newMessage.chat._id
    ) {
      setAllMessages((prev) => [...prev, newMessage]);

      // Emit read receipt for newly received message if this chat is open
      socket.emit("message read", {
        chatId: selectedChat._id,
        userId: user.id,
      });
    } else {
      // Check if notification from this chat already exists
      setNotifications((prev) => {
        const existsIndex = prev.findIndex(
          (n) => n.chat._id === newMessage.chat._id
        );
        if (existsIndex !== -1) {
          // Replace existing notification with latest message
          const updated = [...prev];
          updated[existsIndex] = newMessage;
          return updated;
        }
        // Otherwise, push new notification
        return [...prev, newMessage];
      });
    }
  };

  useEffect(() => {
    fetchMessages();
    selectedChatCompare = selectedChat;
  }, [selectedChat]);

  // Setup socket connection
  useEffect(() => {
    socket = io(process.env.REACT_APP_ENDPOINT_URL, {
      auth: {
        token: user.token,
      },
    });

    socket.emit("setup", user);
    socket.on("connected", () => {
      setIsConnected(true);
    });
  }, [user]);

  // Listen for messages
  useEffect(() => {
    if (!socket) return;

    socket.on("message recieved", handleNewMessage);

    return () => {
      socket.off("message recieved", handleNewMessage);
    };
  }, [selectedChatCompare]);

  // Handle typing users
  useEffect(() => {
    if (!socket) return;

    const handleUserTyping = (typingUser) => {
      setTypingUsers((prev) => {
        if (!prev.find((u) => u._id === typingUser._id)) {
          return [...prev, typingUser];
        }
        return prev;
      });
    };

    const handleUserStopTyping = (typingUser) => {
      setTypingUsers((prev) => prev.filter((u) => u._id !== typingUser._id));
    };

    socket.on("typing", handleUserTyping);
    socket.on("stop typing", handleUserStopTyping);

    return () => {
      socket.off("typing", handleUserTyping);
      socket.off("stop typing", handleUserStopTyping);
    };
  }, []);

  // Scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [allMessages]);

  // Listen for read receipts from backend
  useEffect(() => {
    if (!socket) return;

    const handleMessageRead = ({ chatId, user, messageIds }) => {
      // Only update if the event is for the currently opened chat
      if (selectedChat && selectedChat._id === chatId) {
        setAllMessages((prev) =>
          prev.map((msg) =>
            messageIds.includes(msg._id)
              ? {
                  ...msg,
                  readBy: msg.readBy.some((u) => u._id === user._id)
                    ? msg.readBy.filter((u) => u._id !== user._id)
                    : [...msg.readBy, user],
                }
              : msg
          )
        );
      }
    };

    socket.on("message read", handleMessageRead);

    return () => {
      socket.off("message read", handleMessageRead);
    };
  }, [selectedChat]);

  if (!selectedChat)
    return (
      <Box
        flex="1"
        fontSize="2xl"
        fontFamily="work sans"
        display="flex"
        alignItems="center"
        justifyContent="center"
      >
        Select a chat to start
      </Box>
    );

  const shouldShowAvatar = (msg, index) => {
    const nextMsg = allMessages[index + 1];
    return !nextMsg || nextMsg.sender._id !== msg.sender._id;
  };

  return (
    <Flex direction="column" flex="1" h="full">
      <ChatBoxHeader
        reloadChats={reloadChats}
        setReloadChats={setReloadChats}
      />

      {/* Messages Container */}
      <Box
        flex="1"
        bg="gray.50"
        py="2"
        overflowY="auto"
        css={{
          scrollbarWidth: "thin",
          scrollbarColor: "rgba(0,0,0,0.2) transparent",
          "&::-webkit-scrollbar": {
            width: "0px",
          },
          "&::-webkit-scrollbar-thumb": {
            background: "rgba(0,0,0,0.2)",
            borderRadius: "0px",
          },
          "&::-webkit-scrollbar-track": {
            background: "transparent",
            color: "transparent",
          },
        }}
      >
        {loadingMessages ? (
          <ChatSpinner />
        ) : (
          allMessages.map((msg, idx) => (
            <MessageCard
              key={msg._id}
              message={msg}
              currentUserId={user.id}
              fetchMessages={fetchMessages}
              showAvatar={shouldShowAvatar(msg, idx)}
            />
          ))
        )}
        <div ref={messagesEndRef} />
      </Box>

      {/* Typing Indicator */}
      {typingUsers.length > 0 && (
        <Box display="flex" flexDirection="column" px="3" mb="2" gap="1">
          {typingUsers.map((u) => (
            <Flex
              key={u._id}
              align="center"
              bg="gray.200"
              px="3"
              py="1"
              borderRadius="full"
              gap="2"
              w="fit-content"
            >
              <Text fontSize="sm" fontWeight="medium">
                {u.name} is typing
              </Text>
              <Box display="flex" gap="1">
                <Box className="typing-dot" />
                <Box className="typing-dot" />
                <Box className="typing-dot" />
              </Box>
            </Flex>
          ))}
        </Box>
      )}

      {/* Input + Send Button */}
      <Box
        borderTop="1px solid"
        borderColor="gray.200"
        bg="white"
        p="3"
        position="sticky"
        bottom="0"
      >
        <HStack spacing="3">
          <Input
            placeholder="Type a message..."
            value={newMessage}
            onChange={handleTyping}
            onKeyDown={handleKeyDown}
            disabled={sending}
            variant="filled"
          />
          <Button
            colorScheme="blue"
            onClick={handleSendMessage}
            disabled={sending}
          >
            <Text display={{ base: "none", md: "flex" }}>Send</Text>
            <IoMdSend />
          </Button>
        </HStack>
      </Box>

      {/* Typing animation CSS */}
      <style jsx global>{`
        .typing-dot {
          width: 6px;
          height: 6px;
          background-color: #4a90e2;
          border-radius: 50%;
          animation: bounce 1.4s infinite ease-in-out both;
        }
        .typing-dot:nth-child(1) {
          animation-delay: 0s;
        }
        .typing-dot:nth-child(2) {
          animation-delay: 0.2s;
        }
        .typing-dot:nth-child(3) {
          animation-delay: 0.4s;
        }
        @keyframes bounce {
          0%,
          80%,
          100% {
            transform: scale(0);
          }
          40% {
            transform: scale(1);
          }
        }
      `}</style>
    </Flex>
  );
};

export default ChatsBox;
