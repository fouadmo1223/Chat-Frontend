import { Spinner, Text, VStack } from "@chakra-ui/react";
import React from "react";

const ChatSpinner = () => {
  return (
    <VStack
      height={"100%"}
      alignItems={"center"}
      justifyContent={"center"}
      colorPalette="teal"
    >
      <Spinner
        color="blue.500"
        borderWidth="4px"
        css={{ "--spinner-track-color": "colors.gray.600" }}
        size="xl"
      />
      <Text color="blue.500">Loading Chat...</Text>
    </VStack>
  );
};

export default ChatSpinner;
