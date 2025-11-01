import React, { useEffect, useState } from "react";
import api from "../api/axios";
import { useUser } from "../context/UserContext";
import { Box, Grid, GridItem } from "@chakra-ui/react";
import SideDrawer from "../components/chatPage/SideDrawer";
import ChatsBox from "../components/chatPage/ChatsBox";
import MyChats from "../components/chatPage/MyChats";
import { Toaster } from "../components/ui/toaster";
import { useChatState } from "../context/ChatContext";

const Chats = () => {
  const { user } = useUser();
  const { selectedChat } = useChatState();
  const [reloadChats, setReloadChats] = useState(false);

  return (
    <Box w="100%">
      {user && <SideDrawer />}
      <Toaster />

      {user && (
        <Grid
          templateColumns={{ base: "1fr", md: "4fr 8fr" }}
          gap={4}
          h="calc(100vh - 70px)" // adjust for navbar if you have one
          p={4}
        >
          <GridItem
            bg="gray.50"
            borderRadius="xl"
            boxShadow="sm"
            p={3}
            overflowY="auto"
            display={{ base: selectedChat ? "none" : "flex", md: "flex" }}
          >
            <MyChats
              reloadChats={reloadChats}
              setReloadChats={setReloadChats}
            />
          </GridItem>

          <GridItem
            bg="white"
            borderRadius="xl"
            boxShadow="sm"
            p={3}
            display={{ base: selectedChat ? "flex" : "none", md: "flex" }}
            overflowY="auto"
          >
            <ChatsBox
              reloadChats={reloadChats}
              setReloadChats={setReloadChats}
            />
          </GridItem>
        </Grid>
      )}
    </Box>
  );
};

export default Chats;
