"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  Button,
  CloseButton,
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerCloseTrigger,
  DrawerBackdrop,
  DrawerPositioner,
  Portal,
  Text,
  Input,
  VStack,
  Skeleton,
  Flex,
  Image,
} from "@chakra-ui/react";
import { CiSearch } from "react-icons/ci";
import { LuUser } from "react-icons/lu";
import api from "../../api/axios";
import { toaster } from "../ui/toaster";
import { useChatState } from "../../context/ChatContext";

const SearchDrawer = () => {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const closeButton = useRef(null);
  const [open, setOpen] = useState(false);
  const { selectedChat, setSelectedChat, chats, setChats } = useChatState();

  // Debounced search effect
  useEffect(() => {
    if (!query) {
      setResults([]);
      return;
    }

    setLoading(true);
    const timer = setTimeout(async () => {
      try {
        const res = await api.get(`user?search=${query}`);
        setResults(res.data.users || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }, 500); // 500ms debounce

    return () => clearTimeout(timer);
  }, [query]);

  const accessChat = async (user) => {
    try {
      const { data } = await api.post("chat", {
        userId: user._id,
      });
      setSelectedChat(data.chat);
      if (!chats.find((chat) => chat._id === data.chat._id)) {
        setChats((prevChats) => [...prevChats, data.chat]);
      }
      closeButton.current.click();
    } catch (e) {
      toaster.error({ title: e.message });
    }
  };

  return (
    <Drawer.Root
      open={open}
      onOpenChange={(e) => setOpen(e.open)}
      placement="start"
      size="md"
    >
      <Drawer.Trigger asChild>
        <Button variant="subtle">
          <CiSearch />
          <Text px="4" display={{ base: "none", md: "flex" }}>
            Search Users
          </Text>
        </Button>
      </Drawer.Trigger>

      <Portal>
        <DrawerBackdrop />
        <DrawerPositioner>
          <DrawerContent>
            <DrawerHeader>
              <Drawer.Title>Search Users</Drawer.Title>
            </DrawerHeader>

            <Drawer.Body>
              {/* Search input */}

              <div
                style={{
                  display: "flex",
                  gap: "10px",
                  alignItems: "center",
                }}
              >
                <LuUser />
                <Input
                  placeholder="Type username..."
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                />
              </div>

              {/* Results / Loading */}
              <VStack spacing={3} align="stretch" mt={4}>
                {loading &&
                  Array.from({ length: 3 }).map((_, idx) => (
                    <Flex key={idx} gap="5" align="center">
                      <Skeleton flex="1" height="8" variant="pulse" />
                    </Flex>
                  ))}

                {!loading && results.length === 0 && query && (
                  <Text>No users found</Text>
                )}
                {!loading &&
                  results.length > 0 &&
                  results.map((user) => (
                    <Flex
                      _hover={{ background: "blue.100" }}
                      cursor={"pointer"}
                      borderRadius={"full"}
                      p={"2"}
                      key={user._id}
                      align="center"
                      gap={3}
                      mt={2}
                      onClick={() => {
                        accessChat(user);
                      }}
                    >
                      <Image
                        src={user.avatar || ""}
                        alt={user.name}
                        width={50}
                        height={50}
                        borderRadius="full"
                      />
                      <Text>{user.name}</Text>
                    </Flex>
                  ))}
              </VStack>

              {/* Users List outside VStack */}
            </Drawer.Body>

            <DrawerCloseTrigger asChild>
              <CloseButton ref={closeButton} size="md" />
            </DrawerCloseTrigger>
          </DrawerContent>
        </DrawerPositioner>
      </Portal>
    </Drawer.Root>
  );
};

export default SearchDrawer;
