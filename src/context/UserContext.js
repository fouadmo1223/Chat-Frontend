"use client";

import React, { createContext, useState, useContext, useEffect } from "react";
import { useNavigate } from "react-router-dom";

// 1. Create context
const UserContext = createContext();

// 2. Provider component
export const UserProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  // Optional: persist user in localStorage
  useEffect(() => {
    const savedUser = localStorage.getItem("user");
    if (savedUser) setUser(JSON.parse(savedUser));
    if (!savedUser) navigate("/");
  }, []);

  const login = (userData) => {
    setUser(userData);
    localStorage.setItem("user", JSON.stringify(userData));
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("user");
  };

  return (
    <UserContext.Provider value={{ user, login, logout }}>
      {children}
    </UserContext.Provider>
  );
};

// 3. Custom hook for easier usage
export const useUser = () => useContext(UserContext);
