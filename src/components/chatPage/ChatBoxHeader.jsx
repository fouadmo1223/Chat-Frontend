"use client";

import React, { useState, useEffect } from "react";
import {
  Flex,
  Text,
  IconButton,
  Dialog,
  Portal,
  Box,
  VStack,
  HStack,
  Input,
  Button,
  Skeleton,
  Avatar,
} from "@chakra-ui/react";
import { CiCircleInfo } from "react-icons/ci";
import { useChatState } from "../../context/ChatContext";
import api from "../../api/axios";
import { toaster } from "../ui/toaster";
import { useDebounce } from "../../hooks/useDebounce";
import { useUser } from "../../context/UserContext";
import { AccountInfoModal } from "../ui/AccountInfoModal";
import { CiCircleChevLeft } from "react-icons/ci";

const ChatBoxHeader = ({ reloadChats, setReloadChats }) => {
  const { selectedChat, setSelectedChat } = useChatState();
  const [isOpen, setIsOpen] = useState(false);
  const [chatName, setChatName] = useState("");
  const [users, setUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchLoading, setSearchLoading] = useState(false);
  const { user: currentUser } = useUser();
  const currentUserId = currentUser.id;
  const debouncedSearch = useDebounce(searchTerm, 500);

  useEffect(() => {
    if (selectedChat) {
      setChatName(selectedChat.chatName || "");
      setUsers(
        selectedChat.users?.filter((u) => u._id !== currentUserId) || []
      );
    }
  }, [selectedChat]);

  const isAdmin = selectedChat?.groupAdmin?._id === currentUserId;
  const isGroup = selectedChat?.isGroupChat;

  // Search users
  useEffect(() => {
    if (!debouncedSearch.trim()) return setSearchResults([]);
    const fetchUsers = async () => {
      try {
        setSearchLoading(true);
        const { data } = await api.get(`/user?search=${debouncedSearch}`);
        setSearchResults(
          data.users?.filter((u) => u._id !== currentUserId) || []
        );
      } catch (err) {
        console.error(err);
      } finally {
        setSearchLoading(false);
      }
    };
    fetchUsers();
  }, [debouncedSearch, currentUserId]);

  const handleUpdateName = async () => {
    if (!isAdmin) return;
    try {
      setLoading(true);
      const { data } = await api.put("/chat/group/rename", {
        chatId: selectedChat._id,
        chatName,
      });
      setChatName(data.groupChat.chatName);
      setSelectedChat(data.groupChat);
      setReloadChats(!reloadChats);

      toaster.success({ title: "Chat name updated" });
    } catch (err) {
      toaster.error({ title: err.message });
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveUser = async (user) => {
    if (!isAdmin) {
      toaster.error({ title: "Only admins can remove users" });
      return;
    }
    try {
      setLoading(true);
      const { data } = await api.put("/chat/group/remove", {
        chatId: selectedChat._id,
        userId: user._id,
      });
      setUsers(data.groupChat.users.filter((u) => u._id !== currentUserId));
      toaster.success({ title: `${user.name} removed` });
    } catch (err) {
      toaster.error({ title: err.message });
    } finally {
      setLoading(false);
    }
  };

  const handleAddUser = async (user) => {
    if (!isAdmin) {
      toaster.error({ title: "Only admins can add users" });
      return;
    }
    if (users.find((u) => u._id === user._id)) {
      toaster.info({ title: `${user.name} already in chat`, closable: true });
      return;
    }

    try {
      setLoading(true);
      const { data } = await api.put("/chat/group/add", {
        chatId: selectedChat._id,
        userId: user._id,
      });
      setUsers(data.groupChat.users.filter((u) => u._id !== currentUserId));
      toaster.success({ title: `${user.name} added` });
    } catch (err) {
      toaster.error({ title: err.message });
    } finally {
      setLoading(false);
    }
  };

  const handleLeaveChat = async () => {
    try {
      await api.put("/chat/group/leave", { chatId: selectedChat._id });
      setSelectedChat(null);
      toaster.success({ title: "You left the chat" });
      setReloadChats(!reloadChats);
      setIsOpen(false);
    } catch (err) {
      toaster.error({ title: err.message });
    }
  };

  if (!selectedChat) return null;

  const chatDisplayName = isGroup
    ? chatName
    : selectedChat.users.find((u) => u._id !== currentUserId)?.name || "Chat";

  return (
    <>
      <Flex
        align="center"
        justify="space-between"
        bg="bg.surface"
        p="4"
        borderBottom="1px solid"
        borderColor="border.muted"
      >
        <IconButton
          variant="ghost"
          size="2xl"
          onClick={() => {
            setSelectedChat(null);
          }}
          aria-label="Chat info"
        >
          <CiCircleChevLeft size={25} />
        </IconButton>
        <Text fontWeight="medium" fontSize="lg">
          {chatDisplayName}
        </Text>
        <IconButton
          variant="ghost"
          size="2xl"
          onClick={() => setIsOpen(true)}
          aria-label="Chat info"
        >
          <CiCircleInfo size={25} />
        </IconButton>
      </Flex>

      <Dialog.Root
        scrollBehavior="inside"
        placement={"top"}
        open={isOpen}
        closeOnInteractOutside={true}
        onOpenChange={setIsOpen}
      >
        <Portal>
          <Dialog.Backdrop />
          <Dialog.Positioner>
            <Dialog.Content maxW="md">
              <Dialog.Header>
                <Dialog.Title>Chat Info</Dialog.Title>
              </Dialog.Header>
              <Dialog.Body>
                {isGroup && (
                  <VStack spacing={4} align="stretch">
                    <Box display={"flex"} gap={"6px"}>
                      {isAdmin ? (
                        <>
                          <Input
                            value={chatName}
                            onChange={(e) => setChatName(e.target.value)}
                            placeholder="Chat Name"
                            disabled={!isAdmin}
                          />
                          <Button
                            colorPalette="green"
                            onClick={handleUpdateName}
                            loading={loading}
                          >
                            Update Name
                          </Button>
                        </>
                      ) : (
                        <Text textAlign={"center"} mb={"10px"} fontSize={"xl"}>
                          {chatName}
                        </Text>
                      )}
                    </Box>

                    {/* Current users list */}
                    <VStack align="stretch" spacing={2}>
                      <Text fontWeight="medium" fontSize="sm">
                        Current Users
                      </Text>
                      {users.map((u) => (
                        <HStack key={u._id} justify="space-between">
                          <HStack>
                            <Avatar.Root size="sm">
                              <Avatar.Image src={u.avatar} />
                              <Avatar.Fallback name={u.name} />
                            </Avatar.Root>
                            <Text>{u.name}</Text>
                          </HStack>
                          {isAdmin && (
                            <Button
                              size="xs"
                              colorPalette="red"
                              onClick={() => handleRemoveUser(u)}
                              loading={loading}
                            >
                              Remove
                            </Button>
                          )}
                        </HStack>
                      ))}
                    </VStack>

                    {/* Search users */}
                    {isAdmin && (
                      <Box>
                        <Input
                          placeholder="Search users..."
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                        />
                        {searchLoading && (
                          <VStack mt={2} spacing={2} align="stretch">
                            {[1, 2, 3].map((i) => (
                              <Skeleton
                                key={i}
                                height="40px"
                                borderRadius="md"
                              />
                            ))}
                          </VStack>
                        )}
                        <VStack
                          maxHeight={"140px"}
                          overflowY={"auto"}
                          mt={2}
                          spacing={2}
                          align="stretch"
                        >
                          {searchResults.map((u) => (
                            <HStack key={u._id} justify="space-between">
                              <HStack>
                                <Avatar.Root size="sm">
                                  <Avatar.Image src={u.avatar} />
                                  <Avatar.Fallback name={u.name} />
                                </Avatar.Root>
                                <Text>{u.name}</Text>
                              </HStack>
                              <Button
                                size="xs"
                                colorPalette="green"
                                onClick={() => handleAddUser(u)}
                              >
                                Add
                              </Button>
                            </HStack>
                          ))}
                        </VStack>
                      </Box>
                    )}
                  </VStack>
                )}

                {!isGroup && (
                  <AccountInfoModal
                    user={selectedChat.users.find(
                      (u) => u._id !== currentUserId
                    )}
                    onClose={() => setIsOpen(false)}
                    canEdit={false}
                  />
                )}
              </Dialog.Body>
              <Dialog.Footer>
                {isGroup && (
                  <Flex justifyContent="space-between" width={"100%"}>
                    <Button
                      colorPalette="red"
                      variant="ghost"
                      onClick={handleLeaveChat}
                      loading={loading}
                    >
                      Leave Chat
                    </Button>
                    <Button
                      colorPalette={"blue"}
                      variant={"outline"}
                      size="sm"
                      onClick={() => setIsOpen(false)}
                    >
                      Close
                    </Button>
                  </Flex>
                )}
              </Dialog.Footer>
            </Dialog.Content>
          </Dialog.Positioner>
        </Portal>
      </Dialog.Root>
    </>
  );
};

export default ChatBoxHeader;
