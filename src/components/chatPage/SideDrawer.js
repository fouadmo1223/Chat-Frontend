"use client";

import React, { useEffect, useState } from "react";
import {
  Avatar,
  Badge,
  Box,
  Button,
  Menu,
  Portal,
  Text,
  HStack,
  Stack,
} from "@chakra-ui/react";
import { BiBell } from "react-icons/bi";
import { useNavigate } from "react-router-dom";
import { useUser } from "../../context/UserContext";
import { useChatState } from "../../context/ChatContext";
import { createOverlay } from "@chakra-ui/react";
import { Dialog } from "@chakra-ui/react";
import { AccountInfoModal } from "../ui/AccountInfoModal";
import SearchDrawer from "./SearchDrawer";
import { toaster } from "../ui/toaster";
import api from "../../api/axios";
import { io } from "socket.io-client";

var socket = null;
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

const SideDrawer = () => {
  const { user, logout, login } = useUser();
  const { notifications, setNotifications, setSelectedChat } = useChatState();
  const navigate = useNavigate();
  const [unreadCount, setUnreadCount] = useState(0);

  // Open Account Modal
  const handleAccountModal = async () => {
    await dialog.open("account", {
      title: "My Account",
      content: (
        <AccountInfoModal
          user={user}
          setUser={login}
          onClose={() => dialog.close("account")}
          canEdit={true}
        />
      ),
    });
  };

  // Logout confirmation modal
  const handleLogoutModal = async () => {
    const result = await dialog.open("logout", {
      title: "Confirm Logout",
      description: "Are you sure you want to log out?",
      content: (
        <Stack direction="row" justify="end" spacing={3} mt={2}>
          <Button onClick={() => dialog.close("logout")} variant="outline">
            Cancel
          </Button>
          <Button
            colorPalette="red"
            onClick={() => dialog.close("logout", { confirmed: true })}
          >
            Yes, Logout
          </Button>
        </Stack>
      ),
    });

    await dialog.waitForExit("logout");

    if (result?.confirmed) {
      toaster.create({
        title: "Logging out...",
        description: "Please wait.",
        type: "loading",
        duration: 800,
      });

      setTimeout(() => {
        logout();
        toaster.create({
          title: "Logged out successfully",
          description: "Redirecting to home page...",
          type: "success",
          duration: 2000,
        });
        navigate("/");
      }, 800);
    }
  };

  useEffect(() => {
    socket = io(process.env.REACT_APP_ENDPOINT_URL, {
      auth: {
        token: user.token,
      },
    });

    socket.emit("setup", user);
    socket.on("connected", () => {
      console.log("connected");
    });
  }, [user]);

  useEffect(() => {
    const fetchNotifications = async () => {
      const { data } = await api.get("notifications");
      setNotifications(data);
    };
    fetchNotifications();
  }, []);

  useEffect(() => {
    setUnreadCount(notifications.filter((n) => !n.isRead).length);
  }, [notifications]);

  useEffect(() => {
    socket.on("new notification", (notif) => {
      setNotifications((prev) => {
        // Replace if same chat, push if different
        const index = prev.findIndex((n) => n.chat._id === notif.chat._id);
        if (index !== -1) {
          const copy = [...prev];
          copy[index] = notif;
          return copy;
        }
        return [notif, ...prev];
      });
    });
  }, []);

  return (
    <>
      <Box
        display="flex"
        justifyContent="space-between"
        width="100%"
        backgroundColor="white"
        alignItems="center"
        p="5px 10px"
        borderWidth="5px"
      >
        {/* Search Drawer */}
        <SearchDrawer />

        {/* App Title */}
        <Text
          fontSize="3xl"
          fontFamily="Work Sans"
          color="black"
          fontWeight="medium"
          display={{ base: "none", sm: "flex" }}
        >
          Talksy
        </Text>

        {/* Notifications & User */}
        <HStack spacing={3} pr={4}>
          {/* Notification Menu */}
          <Menu.Root positioning={{ placement: "bottom-center" }}>
            <Menu.Trigger asChild>
              <Button variant="outline" position="relative">
                <BiBell size={22} />
                {unreadCount > 0 && (
                  <Badge
                    position="absolute"
                    top="-1"
                    left="-1"
                    borderRadius="full"
                    colorPalette="red"
                    fontSize="0.85rem"
                    px={1.5}
                  >
                    {unreadCount}
                  </Badge>
                )}
              </Button>
            </Menu.Trigger>
            <Portal>
              <Menu.Positioner>
                <Menu.Content>
                  {1 === 0 ? (
                    <Menu.Item>No new notifications</Menu.Item>
                  ) : (
                    notifications.map((notif) => (
                      <Menu.Item
                        cursor="pointer"
                        _hover={{ bg: "blue.50" }}
                        bg={!notif.isRead ? "blue.100" : "white"} // highlight unread
                        key={notif._id}
                        onClick={async () => {
                          try {
                            await api.put("notifications/read", {
                              notificationId: notif._id,
                            });

                            // Update frontend list
                            setNotifications((prev) =>
                              prev.map((n) =>
                                n._id === notif._id ? { ...n, isRead: true } : n
                              )
                            );

                            // Open chat
                            setSelectedChat(notif.chat);
                          } catch (err) {
                            console.error("Failed to mark as read", err);
                          }
                        }}
                      >
                        <Avatar.Root size="sm">
                          <Avatar.Image src={notif.sender.avatar} />
                          <Avatar.Fallback name={notif.sender.name} />
                        </Avatar.Root>
                        <Box>
                          <Text fontSize="sm">
                            <b>{notif.sender.name}</b> sent you a message
                          </Text>
                          <Text fontSize="xs" color="gray.500">
                            {notif.content.length > 30
                              ? notif.content.substring(0, 30) + "..."
                              : notif.content}
                          </Text>
                        </Box>
                      </Menu.Item>
                    ))
                  )}
                </Menu.Content>
              </Menu.Positioner>
            </Portal>
          </Menu.Root>

          {/* User Avatar Menu */}
          <Menu.Root positioning={{ placement: "bottom-center" }}>
            <Menu.Trigger rounded="full" focusRing="outside">
              <Avatar.Root cursor="pointer" size="md">
                <Avatar.Fallback name={user.name} />
                <Avatar.Image src={user.avatar} />
              </Avatar.Root>
            </Menu.Trigger>
            <Portal>
              <Menu.Positioner>
                <Menu.Content>
                  <Menu.Item
                    _hover={{ bg: "blue.50" }}
                    cursor="pointer"
                    onClick={handleAccountModal}
                  >
                    Account
                  </Menu.Item>
                  <Menu.Item
                    cursor="pointer"
                    _hover={{ bg: "red.50" }}
                    color="fg.error"
                    onClick={handleLogoutModal}
                  >
                    Logout
                  </Menu.Item>
                </Menu.Content>
              </Menu.Positioner>
            </Portal>
          </Menu.Root>
        </HStack>
      </Box>

      <dialog.Viewport />
    </>
  );
};

export default SideDrawer;
