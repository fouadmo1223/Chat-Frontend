import React from 'react';
import ReactDOM from 'react-dom/client';
import { ChakraProvider, defaultSystem } from "@chakra-ui/react";
import App from "./App";
import "./App.css";
import { BrowserRouter } from "react-router-dom";
import { UserProvider } from "./context/UserContext";
import ChatProvider from "./context/ChatContext";

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <BrowserRouter>
    <ChatProvider>
      <ChakraProvider value={defaultSystem}>
        <UserProvider>
          <App />
        </UserProvider>
      </ChakraProvider>
    </ChatProvider>
  </BrowserRouter>
);