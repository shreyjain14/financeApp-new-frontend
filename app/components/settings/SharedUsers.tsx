"use client";

import { useState, useEffect } from "react";
import { useAuth } from "../../contexts/AuthContext";
import { Toast } from "../ui/Toast";
import {
  getSharedWithUsers,
  addSharedUser,
  removeSharedUser,
} from "../../services/defaultsService";

export default function SharedUsers() {
  const { tokens } = useAuth();
  const [users, setUsers] = useState<string[]>([]);
  const [newUserEmail, setNewUserEmail] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [toast, setToast] = useState<{
    message: string;
    type: "success" | "error";
  } | null>(null);

  useEffect(() => {
    if (tokens?.accessToken) {
      loadSharedUsers();
    }
  }, [tokens]);

  const loadSharedUsers = async () => {
    try {
      setIsLoading(true);
      const data = await getSharedWithUsers(tokens?.accessToken!);
      setUsers(data);
    } catch (error) {
      console.error("Failed to load shared users:", error);
      setToast({ message: "Failed to load shared users", type: "error" });
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddUser = async () => {
    if (!newUserEmail.trim()) return;

    try {
      const updatedUsers = await addSharedUser(
        newUserEmail.trim(),
        tokens?.accessToken!
      );
      setUsers(updatedUsers);
      setNewUserEmail("");
      setToast({ message: "User invited successfully", type: "success" });
    } catch (error) {
      setToast({ message: "Failed to invite user", type: "error" });
    }
  };

  const handleRemoveUser = async (email: string) => {
    try {
      const updatedUsers = await removeSharedUser(email, tokens?.accessToken!);
      setUsers(updatedUsers);
      setToast({ message: "User removed successfully", type: "success" });
    } catch (error) {
      setToast({ message: "Failed to remove user", type: "error" });
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex gap-4">
        <input
          type="email"
          value={newUserEmail}
          onChange={(e) => setNewUserEmail(e.target.value)}
          placeholder="Enter email to invite..."
          className="flex-1 p-2 border rounded-md dark:bg-gray-800"
        />
        <button
          onClick={handleAddUser}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
        >
          Invite
        </button>
      </div>

      <div className="space-y-2">
        {users.map((email) => (
          <div
            key={email}
            className="flex justify-between items-center p-3 bg-white dark:bg-gray-800 rounded-lg shadow"
          >
            <span>{email}</span>
            <button
              onClick={() => handleRemoveUser(email)}
              className="text-red-600 hover:text-red-700"
            >
              Remove
            </button>
          </div>
        ))}
      </div>

      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
    </div>
  );
}
