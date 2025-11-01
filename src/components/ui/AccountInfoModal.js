import React, { useState, useRef } from "react";
import {
  Box,
  Button,
  Text,
  Stack,
  Input,
  Spinner,
  HStack,
} from "@chakra-ui/react";

import { toaster } from "../ui/toaster";

import api from "../../api/axios";

export const AccountInfoModal = ({ user, setUser, onClose, canEdit }) => {
  const [editingName, setEditingName] = useState(false);
  const [newName, setNewName] = useState(user.name);
  const [loading, setLoading] = useState(false);
  const fileRef = useRef(null);

  // 🔹 Update profile image
  const handleImageChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setLoading(true);
    const formData = new FormData();
    formData.append("avatar", file);

    try {
      const promise = api.put("/user/avatar", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      toaster.promise(promise, {
        loading: { title: "Uploading image..." },
        success: { title: "Profile image updated!" },
        error: { title: "Image upload failed." },
      });

      const { data } = await promise;

      // 🟢 Update local state + storage instantly
      const updatedUser = { ...user, avatar: data.avatar };
      setUser(updatedUser);
      onClose();
      // localStorage.setItem("user", JSON.stringify(updatedUser));
    } catch (err) {
      toaster.create({
        title: "Error",
        description: err.response?.data?.message || "Image upload failed.",
        type: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  // 🔹 Update user name
  const handleNameSave = async () => {
    if (!newName.trim()) {
      toaster.create({
        title: "Error",
        description: "Name cannot be empty.",
        type: "error",
      });
      return;
    }

    setLoading(true);
    try {
      const promise = api.put("/user/name", { name: newName });

      toaster.promise(promise, {
        loading: { title: "Updating name..." },
        success: { title: "Name updated!" },
        error: { title: "Name update failed." },
      });

      const { data } = await promise;

      // 🟢 Update state + localStorage instantly
      const updatedUser = { ...user, name: data.name };
      setUser(updatedUser);
      //   localStorage.setItem("user", JSON.stringify(updatedUser));
      setEditingName(false);
      onClose();
    } catch (err) {
      toaster.create({
        title: "Error",
        description: err.response?.data?.message || "Update failed.",
        type: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Stack align="center" spacing={3}>
      {/* Clickable Avatar */}
      <Box
        position="relative"
        cursor="pointer"
        onClick={() => fileRef.current?.click()}
      >
        <img
          src={user.avatar}
          alt="Avatar"
          style={{
            width: "140px",
            height: "140px",
            borderRadius: "50%",
            objectFit: "cover",
          }}
        />
        {canEdit && (
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            style={{ display: "none" }}
            onChange={handleImageChange}
          />
        )}
      </Box>

      {/* Editable Name */}
      <HStack spacing={2} align="center">
        {editingName ? (
          <>
            <Input
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              size="sm"
              width="200px"
              autoFocus
              isDisabled={loading}
            />
            <Text
              color="green.500"
              fontSize="sm"
              cursor="pointer"
              onClick={handleNameSave}
            >
              Save
            </Text>
            <Text
              color="red.500"
              fontSize="sm"
              cursor="pointer"
              onClick={() => {
                setEditingName(false);
                setNewName(user.name);
              }}
            >
              Cancel
            </Text>
          </>
        ) : (
          <>
            <Text fontWeight="bold" fontSize="lg">
              {user.name}
            </Text>
            {canEdit && (
              <Text
                color="blue.500"
                fontSize="sm"
                cursor="pointer"
                onClick={() => setEditingName(true)}
              >
                Edit
              </Text>
            )}
          </>
        )}
      </HStack>

      <Text color="gray.500">{user.email}</Text>

      {loading && (
        <Stack align="center" pt={2}>
          <Spinner size="md" />
          <Text fontSize="sm" color="gray.500">
            Processing...
          </Text>
        </Stack>
      )}

      <Button mt={4} onClick={onClose}>
        Close
      </Button>
    </Stack>
  );
};
