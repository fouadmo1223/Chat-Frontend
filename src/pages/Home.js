import { Box, Container, Tabs, Text } from "@chakra-ui/react";
import React, { useEffect } from "react";
import { LuUser } from "react-icons/lu";
import { FaRegIdCard } from "react-icons/fa";
import Login from "../components/auth/Login";
import Register from "../components/auth/Register";
import { Toaster } from "../components/ui/toaster";
import { useUser } from "../context/UserContext";
import { useNavigate } from "react-router-dom";

const Home = () => {
  const { user } = useUser();
  const navigate = useNavigate();
  useEffect(() => {
    if (user) navigate("/chats");
  }, [user]);

  return (
    <div>
      <Container
        overflowX={"hidden"}
        maxW={{ base: "2xl", lg: "3xl" }}
        centerContent
      >
        <Toaster />
        <Box
          display={"flex"}
          w={"100%"}
          justifyContent={"center"}
          p={"3"}
          bg={"white"}
          m={"40px 0 15px 0px"}
          borderRadius={"lg"}
          borderWidth={"1"}
        >
          <Text
            fontSize={"2xl"}
            fontFamily={"Work Sans"}
            color={"black"}
            fontWeight={"medium"}
          >
            Talksy
          </Text>
        </Box>
        <Box
          w={"100%"}
          p={"4"}
          mb={"3"}
          bg={"white"}
          borderRadius={"lg"}
          borderWidth={"1"}
        >
          <Tabs.Root defaultValue="login" variant="plain">
            <Tabs.List
              fontSize={"xl"}
              width={"100%"}
              bg="bg.muted"
              rounded="l3"
              p="2"
              mb={"1rem"}
            >
              <Tabs.Trigger
                display={"flex"}
                gap={"2"}
                justifyContent={"center"}
                width={"50%"}
                fontSize={"20px"}
                value="login"
              >
                <LuUser />
                Login
              </Tabs.Trigger>
              <Tabs.Trigger
                display={"flex"}
                gap={"2"}
                justifyContent={"center"}
                width={"50%"}
                fontSize={"20px"}
                value="register"
              >
                <FaRegIdCard />
                Register
              </Tabs.Trigger>

              <Tabs.Indicator rounded="l2" />
            </Tabs.List>
            <Tabs.Content value="login">
              <Login />
            </Tabs.Content>
            <Tabs.Content value="register">
              <Register />
            </Tabs.Content>
          </Tabs.Root>
        </Box>
      </Container>
    </div>
  );
};

export default Home;
