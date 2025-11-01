"use client";

import React, { useState } from "react";
import { Box, Flex, Text, VStack, Avatar } from "@chakra-ui/react";

const MessageCard = ({ message, currentUserId, showAvatar }) => {
  const isSender = message.sender._id === currentUserId;
  const [showTime, setShowTime] = useState(false);
  const [showReadBy, setShowReadBy] = useState(false);

  const handleClick = () => {
    setShowTime((prev) => !prev);
    if (isSender) setShowReadBy((prev) => !prev);
  };
  const handleDoubleClick = () => {};

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
          onDoubleClick={handleDoubleClick} // only for sender
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
          <Text whiteSpace="pre-wrap" wordBreak="break-word">
            {message.isDeleted ? <i>Message deleted</i> : message.content}
          </Text>
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

          {/* Read By List - only for messages sent by current user */}
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
                  .filter((u) => u._id !== currentUserId) // exclude self
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
