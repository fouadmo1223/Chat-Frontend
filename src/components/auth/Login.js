"use client";

import React, { useContext, useState } from "react";
import {
  Field,
  Fieldset,
  Input,
  VStack,
  Button,
  Text,
  Box,
} from "@chakra-ui/react";
import { PasswordInput } from "../ui/password-input";
import { Toaster, toaster } from "../ui/toaster";
import api from "../../api/axios";
import { useUser } from "../../context/UserContext";
import { useNavigate } from "react-router-dom";

const Login = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [errors, setErrors] = useState({});
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { login } = useUser();

  // 🔹 Handle input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  // 🔹 Handle login submit
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const newErrors = {};
    if (!formData.email) newErrors.email = "Email is required";
    if (!formData.password) newErrors.password = "Password is required";

    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0) return;

    try {
      const promise = api.post("/auth/login", formData, {
        headers: { "Content-Type": "application/json" },
      });

      // Toast notifications for promise states
      toaster.promise(promise, {
        loading: {
          title: "Logging in...",
          description: "Please wait while we check your credentials.",
          closable: true,
        },
        success: {
          title: "Login successful!",
          description: "Welcome back 👋",
          closable: true,
        },
      });

      const res = await promise;

      setError("");
      window.localStorage.setItem("token", res.data.user.token);
      login(res.data.user);

      // Example: redirect or save user data here
      // localStorage.setItem("token", res.data.token);

      setFormData({ email: "", password: "" });
      setErrors({});
      navigate("/chats");
    } catch (err) {
      console.error("❌ Login Error:", err);

      // Field-specific validation errors from backend
      if (err.response?.data?.errors) {
        setErrors(err.response.data.errors);
      } else if (err.response?.data?.message) {
        setError(err.response.data.message);
        toaster.create({
          title: "Error",
          description: err.response.data.message,
          type: "error",
          closable: true,
        });
      }
    } finally {
      setLoading(false);
    }
  };

  // 🔹 Handle guest login (example: hardcoded creds)
  const handleGetGuestUser = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const guestData = {
        email: "guest@example.com",
        password: "123456",
      };

      const promise = api.post("/auth/login", guestData, {
        headers: { "Content-Type": "application/json" },
      });

      toaster.promise(promise, {
        loading: {
          title: "Logging in as guest...",
          description: "Please wait.",
          closable: true,
        },
        success: {
          title: "Guest login successful!",
          description: "Welcome to the demo account 👋",
          closable: true,
        },
        error: {
          title: "Guest login failed",
          description: "Unable to log in as guest right now.",
          closable: true,
        },
      });

      const res = await promise;
    } catch (err) {
      toaster.error("❌ Guest Login Error:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <VStack gap={3} w="100%">
        <Fieldset.Root size="lg">
          <Fieldset.Content>
            {/* Email */}
            <Field.Root required>
              <Field.Label>Email</Field.Label>
              <Input
                name="email"
                value={formData.email}
                placeholder="me@example.com"
                onChange={handleChange}
              />
              {errors.email && <Text color="red.500">{errors.email}</Text>}
            </Field.Root>

            {/* Password */}
            <Field.Root required>
              <Field.Label>Password</Field.Label>
              <PasswordInput
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="Enter your password"
              />
              {errors.password && (
                <Text color="red.500">{errors.password}</Text>
              )}
            </Field.Root>
            {error && <Text color="red.500">{error}</Text>}
          </Fieldset.Content>
        </Fieldset.Root>

        {/* Submit Button */}
        <Button
          type="submit"
          mt={2}
          colorScheme="blue"
          w="full"
          loading={loading}
        >
          Login
        </Button>

        {/* Guest Login Button */}
        
      </VStack>
    </form>
  );
};

export default Login;
