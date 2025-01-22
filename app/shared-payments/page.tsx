"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useAuth } from "../contexts/AuthContext";
import { getSharedUserPayments } from "../services/paymentService";
import { getSharedToMeUsers } from "../services/defaultsService";
import { Payment } from "../types/payment";
import Navbar from "../components/navigation/Navbar";
import { Toast } from "../components/ui/Toast";
import { DateFilter } from "../components/ui/DateFilter";

export default function SharedPayments() {
  const { user, tokens } = useAuth();
  const [payments, setPayments] = useState<Payment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState<string | null>(null);
  const [sharedUsers, setSharedUsers] = useState<string[]>([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [error, setError] = useState("");
  const [toast, setToast] = useState<{
    message: string;
    type: "success" | "error" | "info";
  } | null>(null);

  const fetchPayments = async (pageNum: number, append: boolean = false) => {
    try {
      if (!tokens?.accessToken || !selectedUser) return;

      if (!append) setIsLoading(true);

      const response = await getSharedUserPayments(
        selectedUser,
        pageNum,
        tokens.accessToken
      );

      const data = response.data;

      if (append) {
        setPayments((prev) => [...prev, ...data]);
      } else {
        setPayments(data);
      }

      setHasMore(data.length === 20);
    } catch (error) {
      console.error("Failed to fetch shared payments:", error);
      setToast({
        message: "Failed to fetch shared payments",
        type: "error",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Load shared users
  useEffect(() => {
    if (tokens?.accessToken) {
      loadSharedUsers();
    }
  }, [tokens]);

  const loadSharedUsers = async () => {
    try {
      const users = await getSharedToMeUsers(tokens?.accessToken!);
      setSharedUsers(users);
      if (users.length > 0) {
        setSelectedUser(users[0]);
      }
    } catch (error) {
      console.error("Failed to load shared users:", error);
      setToast({
        message: "Failed to load users sharing with you",
        type: "error",
      });
    }
  };

  // Fetch payments when user is selected
  useEffect(() => {
    if (selectedUser) {
      fetchPayments(1, false);
    }
  }, [selectedUser]);

  if (!user) return null;

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-16">
      <main className="container mx-auto px-4 py-8">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
          <h1 className="text-2xl font-bold">Shared Payments</h1>
          <select
            value={selectedUser || ""}
            onChange={(e) => setSelectedUser(e.target.value)}
            className="px-3 py-2 border rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
          >
            {sharedUsers.map((email) => (
              <option key={email} value={email}>
                {email}'s Payments
              </option>
            ))}
          </select>
        </div>

        <div className="space-y-4">
          {payments.map((payment) => (
            <div
              key={payment.id}
              className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow"
            >
              <p className="font-medium">
                {payment.amount} {payment.currency}
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                From: {payment.payedFrom}
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                To: {payment.payedTo}
              </p>
              <p className="text-xs text-gray-500">
                {new Date(payment.date).toLocaleString()}
              </p>
            </div>
          ))}
        </div>

        {payments.length === 0 && !isLoading && (
          <div className="text-center text-gray-500 mt-8">
            No shared payments found
          </div>
        )}
      </main>

      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}

      <Navbar />
    </div>
  );
}
