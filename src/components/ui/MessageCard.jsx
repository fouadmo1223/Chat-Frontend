"use client";

import React, { useState } from "react";
import {
  Box,
  Flex,
  Text,
  VStack,
  Avatar,
  Button,
  Input,
  HStack,
  Portal,
  Menu,
} from "@chakra-ui/react";
import { FaEdit, FaTrashAlt, FaUndo } from "react-icons/fa";
import api from "../../api/axios";
import { toaster } from "./toaster";

const MessageCard = ({ message, currentUserId, fetchMessages, showAvatar }) => {
  const isSender = message.sender._id === currentUserId;
  const [showTime, setShowTime] = useState(false);
  const [showReadBy, setShowReadBy] = useState(false);

  // New states for editing
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState(message.content);
  const [loading, setLoading] = useState(false);

  const handleClick = () => {
    setShowTime((prev) => !prev);
    if (isSender) setShowReadBy((prev) => !prev);
  };

  // Edit message
  const handleEdit = async () => {
    if (!editContent.trim()) {
      toaster.error({
        title: "Message is empty",
        description: "Please enter a message",
      });
      return;
    }
    setLoading(true);
    try {
      await api.put(`message/${message._id}`, { content: editContent });
      setIsEditing(false);
      fetchMessages();
      toaster.success({ title: "Message updated" });
    } catch {
      toaster.error({ title: "Failed to update message" });
    } finally {
      setLoading(false);
    }
  };

  // Delete or Retrieve message (same endpoint)
  const handleDeleteOrRetrieve = async () => {
    setLoading(true);
    try {
      await api.delete(`/message/${message._id}`);
      fetchMessages();
      toaster.success({
        title: message.isDeleted ? "Message restored" : "Message deleted",
      });
    } catch {
      toaster.error({ title: "Failed to delete or retrieve message" });
    } finally {
      setLoading(false);
    }
  };

  const bubbleBg = message.isDeleted
    ? "gray.200"
    : isSender
    ? "blue.500"
    : "gray.100";
  const textColor = isSender ? "white" : "black";

  return (
    <Flex
      justify={isSender ? "flex-end" : "flex-start"}
      mb="1"
      px="2"
      align="flex-end"
    >
      {/* Avatar only for others */}
      {!isSender && showAvatar && (
        <Avatar.Root size="2xs" mr="2">
          <Avatar.Image src={message.sender.avatar} />
          <Avatar.Fallback name={message.sender.name} />
        </Avatar.Root>
      )}

      <VStack
        align={isSender ? "flex-end" : "flex-start"}
        spacing="1"
        maxW="70%"
      >
        <Flex w="100%" gap={"10px"}>
          {/* Three dots menu for sender */}
          {isSender && !isEditing && (
            <Menu.Root>
              <Menu.Trigger asChild>
                <Button size="sm" variant="outline" ml="2">
                  ⋮
                </Button>
              </Menu.Trigger>
              <Portal>
                <Menu.Positioner>
                  <Menu.Content minW="120px">
                    {!message.isDeleted ? (
                      <>
                        {message.canEdit && (
                          <Menu.Item asChild>
                            <Button
                              cursor={"pointer"}
                              variant="ghost"
                              w="full"
                              justifyContent="flex-start"
                              colorPalette="blue"
                              onClick={() => setIsEditing(true)}
                            >
                              <FaEdit />
                              <Text fontSize={{ base: "14px", md: "16px" }}>
                                Edit
                              </Text>
                            </Button>
                          </Menu.Item>
                        )}
                        <Menu.Item asChild>
                          <Button
                            cursor={"pointer"}
                            variant="ghost"
                            w="full"
                            justifyContent="flex-start"
                            colorPalette="red"
                            onClick={handleDeleteOrRetrieve}
                          >
                            <FaTrashAlt />
                            <Text fontSize={{ base: "14px", md: "16px" }}>
                              Delete
                            </Text>
                          </Button>
                        </Menu.Item>
                      </>
                    ) : (
                      <Menu.Item asChild>
                        <Button
                          cursor={"pointer"}
                          variant="ghost"
                          w="full"
                          justifyContent="flex-start"
                          colorPalette="green"
                          onClick={handleDeleteOrRetrieve}
                        >
                          <FaUndo />
                          <Text fontSize={{ base: "14px", md: "16px" }}>
                            Retrieve
                          </Text>
                        </Button>
                      </Menu.Item>
                    )}
                  </Menu.Content>
                </Menu.Positioner>
              </Portal>
            </Menu.Root>
          )}

          <Flex
            align="center"
            flexDir={isSender ? "row-reverse" : "row"}
            bg={bubbleBg}
            color={textColor}
            borderRadius="20px"
            px="4"
            py="2"
            position="relative"
            minH="40px"
            boxShadow="md"
            onClick={handleClick}
          >
            {/* Tail */}
            <Box
              sx={{
                width: 0,
                height: 0,
                borderTop: "10px solid transparent",
                borderBottom: "10px solid transparent",
                borderLeft: isSender ? "none" : "10px solid gray.100",
                borderRight: isSender ? "10px solid blue.500" : "none",
                alignSelf: "flex-end",
                mt: "1",
                mr: isSender ? "0" : "-2",
                ml: isSender ? "-2" : "0",
              }}
            />

            {/* Message content or edit input */}
            {isEditing ? (
              <HStack spacing={2}>
                <Input
                  value={editContent}
                  onChange={(e) => setEditContent(e.target.value)}
                  size="sm"
                  autoFocus
                  disabled={loading}
                />
                <Button
                  size="sm"
                  colorPalette="green"
                  onClick={handleEdit}
                  loading={loading}
                >
                  Save
                </Button>
                <Button size="sm" onClick={() => setIsEditing(false)}>
                  Cancel
                </Button>
              </HStack>
            ) : (
              <Text
                fontSize={{ base: "13px", md: "16px" }}
                whiteSpace="pre-wrap"
                wordBreak="break-word"
              >
                {message.isDeleted ? <i>Message deleted</i> : message.content}
              </Text>
            )}
          </Flex>
        </Flex>

        <Box display={"flex"} gap={"5px"} alignItems={"baseline"}>
          {showTime && (
            <Text
              fontSize="10px"
              color="gray.500"
              textAlign={isSender ? "right" : "left"}
            >
              {new Date(message.createdAt).toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
              })}
            </Text>
          )}

          {/* Read By List */}
          {isSender &&
            showReadBy &&
            message.readBy &&
            message.readBy.length > 0 && (
              <Flex
                wrap="wrap"
                gap="1"
                mt="1"
                px="2"
                fontSize="10px"
                color="gray.600"
              >
                Read By
                {message.readBy
                  .filter((u) => u._id !== currentUserId)
                  .map((u) => (
                    <Flex key={u._id} align="center" gap="1">
                      <Text>{u.name}</Text>
                    </Flex>
                  ))}
              </Flex>
            )}
        </Box>
      </VStack>
    </Flex>
  );
};

export default MessageCard;
