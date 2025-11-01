"use client";

import React, { useState, useEffect } from "react";
import {
  Box,
  VStack,
  Input,
  Button,
  Text,
  Flex,
  TagsInput,
  Dialog,
  Skeleton,
  Image,
} from "@chakra-ui/react";
import { toaster } from "./toaster";
import api from "../../api/axios";
import { useDebounce } from "../../hooks/useDebounce";
import { useChatState } from "../../context/ChatContext";

const CreateGroupModal = ({ user, setUser, onClose }) => {
  const [groupName, setGroupName] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchLoading, setSearchLoading] = useState(false);
  const { chats, setChats, selectedChat, setSelectedChat } = useChatState();

  const debouncedSearch = useDebounce(searchTerm, 500);

  // Fetch users with debounce
  useEffect(() => {
    if (!debouncedSearch.trim()) {
      setSearchResults([]);
      return;
    }

    const fetchUsers = async () => {
      try {
        setSearchLoading(true);
        const { data } = await api.get(`/user?search=${debouncedSearch}`);
        setSearchResults(data.users || []); // ✅ use data.users
      } catch (err) {
        console.error(err);
      } finally {
        setSearchLoading(false);
      }
    };

    fetchUsers();
  }, [debouncedSearch]);

  // Handle tags change
  const handleTagChange = (details) => {
    const newValues = details.value;
    const lastValue = newValues[newValues.length - 1];
    const foundUser = searchResults.find((u) => u.name === lastValue);

    if (foundUser && !selectedUsers.find((u) => u._id === foundUser._id)) {
      setSelectedUsers((prev) => [...prev, foundUser]);
    }

    const updated = selectedUsers.filter((u) => newValues.includes(u.name));
    setSelectedUsers(updated);
  };

  // Create group
  const handleCreate = async () => {
    if (!groupName.trim() || selectedUsers.length === 0) {
      toaster.error({
        title: "Missing fields",
        description: "Please fill all required fields.",
      });
      return;
    }
    if (selectedUsers.length < 2) {
      toaster.error({
        title: "Missing fields",
        description: "At least Two Users Required",
      });
      return;
    }

    try {
      setLoading(true);
      const usersString = JSON.stringify(selectedUsers.map((u) => u._id));

      const { data } = await api.post("/chat/group", {
        name: groupName,
        users: usersString,
      });

      toaster.success({ title: "Group created successfully!" });
      setSelectedChat(data.groupChat);
      if (!chats.find((chat) => chat._id === data.groupChat._id)) {
        setChats((prevChats) => [data.groupChat, ...prevChats]);
      }
      onClose();
    } catch (err) {
      toaster.error({
        title: "Failed to create group",
        description: err.response.data.message,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog.Body>
      <VStack gap="4" align="stretch">
        {/* Chat Name */}
        <Box>
          <Text mb="1" fontWeight="medium" fontSize="sm">
            Chat Name
          </Text>
          <Input
            placeholder="Enter chat name..."
            value={groupName}
            onChange={(e) => setGroupName(e.target.value)}
          />
        </Box>

        {/* User Search */}
        <Box position="relative">
          <TagsInput.Root
            value={selectedUsers.map((u) => u.name)}
            onValueChange={handleTagChange}
          >
            <TagsInput.Label>Users</TagsInput.Label>
            <TagsInput.Control>
              <TagsInput.Items />
              <TagsInput.Input
                placeholder="Search users..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </TagsInput.Control>
          </TagsInput.Root>

          {/* Dropdown below input */}
          {searchTerm && (
            <Box
              position="absolute"
              top="100%"
              left="0"
              right="0"
              bg="bg.surface"
              shadow="md"
              borderRadius="md"
              mt="1"
              zIndex="10"
              maxH="200px"
              overflowY="auto"
            >
              {/* Skeleton loading */}
              {searchLoading
                ? Array.from({ length: 5 }).map((_, i) => (
                    <Box bg={"white"} key={i} px="3" py="2">
                      <Skeleton height="20px" mb="2" />
                    </Box>
                  ))
                : searchResults.length > 0
                ? searchResults.map((u) => (
                    <Box
                      key={u._id}
                      px="3"
                      py="2"
                      display={"flex"}
                      gap={"8px"}
                      bg={"white"}
                      cursor="pointer"
                      _hover={{ bg: "blue.200" }}
                      onClick={() => {
                        if (!selectedUsers.find((sel) => sel._id === u._id)) {
                          setSelectedUsers((prev) => [...prev, u]);
                        }
                        setSearchTerm("");
                        setSearchResults([]);
                      }}
                    >
                      <div>
                        <Image
                          src={u.avatar || ""}
                          alt={u.name}
                          width={50}
                          height={50}
                          borderRadius="full"
                        />
                      </div>
                      <div>
                        <Text fontWeight="medium">{u.name}</Text>
                        <Text fontSize="sm" color="fg.muted">
                          {u.email}
                        </Text>
                      </div>
                    </Box>
                  ))
                : !searchLoading && (
                    <Text px="3" py="2" color="fg.muted">
                      No users found.
                    </Text>
                  )}
            </Box>
          )}
        </Box>

        {/* Buttons */}
        <Flex justify="end" gap="3" pt="2">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button
            colorPalette="blue"
            onClick={handleCreate}
            loading={loading}
            disabled={loading}
          >
            Create
          </Button>
        </Flex>
      </VStack>
    </Dialog.Body>
  );
};

export default CreateGroupModal;
