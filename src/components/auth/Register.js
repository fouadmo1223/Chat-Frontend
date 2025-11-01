"use client";

import React, { useState, useMemo } from "react";
import {
  Field,
  Fieldset,
  Input,
  VStack,
  Button,
  Text,
  Box,
  Image,
  Flex,
} from "@chakra-ui/react";
import { passwordStrength } from "check-password-strength";
import { PasswordInput, PasswordStrengthMeter } from "../ui/password-input";
import { LuUpload, LuX } from "react-icons/lu";
import { toaster } from "../ui/toaster";
import api from "../../api/axios";

const strengthOptions = [
  { id: 1, value: "weak", minDiversity: 0, minLength: 0 },
  { id: 2, value: "medium", minDiversity: 2, minLength: 6 },
  { id: 3, value: "strong", minDiversity: 3, minLength: 8 },
  { id: 4, value: "very-strong", minDiversity: 4, minLength: 10 },
];

const Register = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const strength = useMemo(() => {
    if (!formData.password) return 0;
    const result = passwordStrength(formData.password, strengthOptions);
    return result.id;
  }, [formData.password]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const handleFileChange = (e) => {
    const selected = e.target.files[0];
    if (selected && selected.size > 2 * 1024 * 1024) {
      setErrors((prev) => ({
        ...prev,
        file: "File too large. Max 2MB allowed.",
      }));
      setFile(null);
      setPreview(null);
    } else if (selected) {
      setFile(selected);
      setErrors((prev) => ({ ...prev, file: "" }));
      setPreview(URL.createObjectURL(selected));
    }
  };

  const handleRemoveImage = () => {
    setFile(null);
    setPreview(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const newErrors = {};
    if (!formData.name) newErrors.name = "Name is required";
    if (!formData.email) newErrors.email = "Email is required";
    if (!formData.password) newErrors.password = "Password is required";
    if (formData.password !== formData.confirmPassword)
      newErrors.confirmPassword = "Passwords do not match";
    // if (!file) newErrors.file = "Profile image is required";

    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0) return;

    try {
      setLoading(true);

      const data = new FormData();
      data.append("name", formData.name);
      data.append("email", formData.email);
      data.append("password", formData.password);
      data.append("confirmPassword", formData.confirmPassword);
      data.append("image", file);

      // Use toast with closable promise
      const promise = api.post("/auth/register", data, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      toaster.promise(promise, {
        loading: {
          title: "Registering...",
          description: "Please wait while we create your account.",
          closable: true,
        },
        success: {
          title: "Registration successful!",
          description: "Welcome aboard 🎉",
          closable: true,
        },
        error: {
          title: "Registration failed",
          description: "Please check the form and try again.",
          closable: true,
        },
      });

      const res = await promise;

      setFormData({ name: "", email: "", password: "", confirmPassword: "" });
      setFile(null);
      setPreview(null);
      setErrors({});
    } catch (err) {
      console.error("❌ Registration Error:", err);

      // ✅ Display backend field errors under fields
      if (err.response?.data?.errors) {
        setErrors(err.response.data.errors);
      }

      // ✅ Show general backend message via toast
      else if (err.response?.data?.message) {
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

  return (
    <Box position="relative" aria-busy={loading} userSelect="none">
      <form onSubmit={handleSubmit}>
        <VStack gap={3} w="100%">
          <Fieldset.Root size="lg" invalid={false}>
            <Fieldset.Content gap="7px">
              {/* Name */}
              <Field.Root required>
                <Field.Label>Name</Field.Label>
                <Input
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                />
                {errors.name && (
                  <Text color="red.500" fontSize="sm">
                    {errors.name}
                  </Text>
                )}
              </Field.Root>

              {/* Email */}
              <Field.Root required>
                <Field.Label>Email</Field.Label>
                <Input
                  name="email"
                  value={formData.email}
                  placeholder="me@example.com"
                  onChange={handleChange}
                />
                {errors.email && (
                  <Text color="red.500" fontSize="sm">
                    {errors.email}
                  </Text>
                )}
              </Field.Root>

              {/* Password */}
              <Field.Root required>
                <Field.Label>Password</Field.Label>
                <PasswordInput
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Enter password"
                />
                <PasswordStrengthMeter value={strength} />
                {errors.password && (
                  <Text color="red.500" fontSize="sm">
                    {errors.password}
                  </Text>
                )}
              </Field.Root>

              {/* Confirm Password */}
              <Field.Root required>
                <Field.Label>Confirm Password</Field.Label>
                <Input
                  name="confirmPassword"
                  type="password"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                />
                {errors.confirmPassword && (
                  <Text color="red.500" fontSize="sm">
                    {errors.confirmPassword}
                  </Text>
                )}
              </Field.Root>

              {/* Custom File Input */}
              <Field.Root>
                <Field.Label>Profile Image</Field.Label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  style={{ display: "none" }}
                  id="fileInput"
                />
                <Flex direction="column" gap={2}>
                  <Button
                    as="label"
                    htmlFor="fileInput"
                    leftIcon={<LuUpload />}
                    variant="outline"
                    size="sm"
                  >
                    <LuUpload /> Choose Image
                  </Button>

                  {preview && (
                    <Box position="relative" w="fit-content">
                      <Image
                        src={preview}
                        boxSize="80px"
                        objectFit="cover"
                        borderRadius="md"
                        border="1px solid #ccc"
                      />
                      <Button
                        size="xs"
                        colorScheme="red"
                        variant="ghost"
                        position="absolute"
                        top="-6px"
                        right="-6px"
                        onClick={handleRemoveImage}
                      >
                        <LuX />
                      </Button>
                    </Box>
                  )}
                </Flex>
                {errors.file && (
                  <Text color="red.500" fontSize="sm">
                    {errors.file}
                  </Text>
                )}
              </Field.Root>
            </Fieldset.Content>
          </Fieldset.Root>

          <Button
            loading={loading}
            type="submit"
            mt={2}
            colorScheme="blue"
            w="full"
          >
            Register
          </Button>
        </VStack>
      </form>
    </Box>
  );
};

export default Register;
