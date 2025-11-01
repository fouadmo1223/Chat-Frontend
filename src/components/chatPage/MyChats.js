"use client";

import React, { useEffect, useState } from "react";
import {
  VStack,
  Flex,
  Text,
  Skeleton,
  Avatar,
  Card,
  Badge,
  Box,
  Button,
  createOverlay,
  Dialog,
  Portal,
} from "@chakra-ui/react";
import { useChatState } from "../../context/ChatContext";
import api from "../../api/axios";
import { toaster } from "../ui/toaster";
import { useUser } from "../../context/UserContext";
import { IoIosAdd } from "react-icons/io";
import CreateGroupModal from "../ui/CreateGroupModal";

// Format time as "Today", "Yesterday", or short date
const formatDate = (dateStr) => {
  if (!dateStr) return "";
  const date = new Date(dateStr);
  const now = new Date();
  const diff = now - date;
  const oneDay = 24 * 60 * 60 * 1000;

  if (diff < oneDay) {
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  } else if (diff < 2 * oneDay) {
    return "Yesterday";
  } else {
    return date.toLocaleDateString([], { month: "short", day: "numeric" });
  }
};

const dialog = createOverlay((props) => {
  const { title, description, content, ...rest } = props;
  return (
    <Dialog.Root {...rest}>
      <Portal>
        <Dialog.Backdrop />
        <Dialog.Positioner>
          <Dialog.Content>
            {title && (
              <Dialog.Header>
                <Dialog.Title>{title}</Dialog.Title>
              </Dialog.Header>
            )}
            <Dialog.Body>
              {description && (
                <Dialog.Description mb={4}>{description}</Dialog.Description>
              )}
              {content}
            </Dialog.Body>
          </Dialog.Content>
        </Dialog.Positioner>
      </Portal>
    </Dialog.Root>
  );
});

const MyChats = ({ reloadChats, setReloadChats }) => {
  const { selectedChat, setSelectedChat, chats, setChats } = useChatState();
  const [loading, setLoading] = useState(true);
  const { user, login } = useUser();

  const fetchData = async () => {
    try {
      setLoading(true);
      const { data } = await api.get("chat");
      setChats(data);
    } catch (error) {
      toaster.error({
        title: "Error fetching chats",
        description: error.message,
      });
      console.error("Error fetching chats:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [reloadChats]);

  // 🔹 Create Group Modal
  const handelCreateGroup = async () => {
    await dialog.open("account", {
      title: "Create Group",
      content: (
        <CreateGroupModal
          user={user}
          setUser={login}
          onClose={() => dialog.close("account")}
        />
      ),
    });
  };


  return (
    <>
      <VStack width={"100%"} mb={"2"} gap="3" align="stretch" p="4">
        <Box
          display={"flex"}
          justifyContent={"space-between"}
          gap={"10px"}
          // flexDir={{ base: "column", lg: "row" }}
          alignItems={{ base: "start", md: "center" }}
        >
          <Text fontSize="xl" fontWeight="bold">
            My Chats
          </Text>
          <Button
            variant="surface"
            onClick={handelCreateGroup}
            colorPalette={"blue"}
          >
            <Text display={{ base: "none", lg: "flex" }}>Create New Group</Text>

            <IoIosAdd />
          </Button>
        </Box>

        {/* Skeleton Loading */}
        {loading &&
          Array.from({ length: 5 }).map((_, idx) => (
            <Skeleton key={idx} height="58px" borderRadius="md" />
          ))}

        {/* Chat List */}
        {!loading &&
          chats.map((chat) => {
            const isGroup = chat.isGroupChat;

            const chatName = isGroup
              ? chat.chatName
              : chat.users?.find((u) => u._id !== user?.id)?.name || "Unknown";

            const chatAvatar = isGroup
              ? chat.groupAdmin?.avatar
              : chat.users?.find((u) => u._id !== user?.id)?.avatar;

            const lastMessage = chat.latestMessage?.content || "Start chat";
            const lastDate = chat.latestMessage?.createdAt
              ? formatDate(chat.latestMessage.createdAt)
              : "";

            return (
              <Card.Root
                key={chat._id}
                borderWidth="1px"
                borderColor="gray.200"
                borderRadius="md"
                width={"100%"}
                cursor="pointer"
                transition="all 0.2s ease"
                _hover={{ bg: "blue.100", transform: "scale(1.01)" }}
                bg={selectedChat?._id === chat._id ? "blue.100" : "white"}
                onClick={() => setSelectedChat(chat)}
                h="58px"
              >
                <Card.Body py="2" px="3">
                  <Flex align="center" justify="space-between" h="full">
                    {/* Left side: Avatar + Name + Message */}
                    <Flex align="center" gap="3" overflow="hidden">
                      <Box display={{ base: "none", md: "flex" }}>
                        <Avatar.Root size="sm">
                          <Avatar.Image src={chatAvatar} />
                          <Avatar.Fallback name={chatName} />
                        </Avatar.Root>
                      </Box>

                      <Box overflow="hidden">
                        <Flex align="center" gap="2">
                          <Text
                            fontWeight="medium"
                            noOfLines={1} // limits to one line
                            isTruncated
                            fontSize={{ base: "12px", md: "14px", lg: "16px" }}
                          >
                            {chatName.length > 15
                              ? `${chatName.slice(0, 15)}...`
                              : chatName}
                          </Text>

                          {/* Group badge */}
                          {isGroup && (
                            <Badge
                              colorPalette="blue"
                              variant="subtle"
                              fontSize="0.7rem"
                              borderRadius="sm"
                            >
                              Group
                            </Badge>
                          )}
                        </Flex>

                        {/* Last message */}
                        <Text
                          fontSize="sm"
                          color="gray.600"
                          noOfLines={1}
                          maxW="180px"
                        >
                          {lastMessage.length > 15
                              ? `${lastMessage.slice(0, 15)}...`
                              : lastMessage}
                        </Text>
                      </Box>
                    </Flex>

                    {/* Right side: Date */}
                    {lastDate && (
                      <Text
                        fontSize="xs"
                        color="gray.500"
                        minW="55px"
                        textAlign="right"
                      >
                        {lastDate}
                      </Text>
                    )}
                  </Flex>
                </Card.Body>
              </Card.Root>
            );
          })}
      </VStack>
      <dialog.Viewport />{" "}
    </>
  );
};

export default MyChats;
