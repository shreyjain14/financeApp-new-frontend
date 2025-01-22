"use client";

import { useState, useEffect } from "react";
import { useAuth } from "../../contexts/AuthContext";
import { Toast } from "../ui/Toast";
import {
  getPayedFromDefaults,
  addPayedFromDefault,
  deletePayedFromDefault,
} from "../../services/defaultsService";

// Similar structure to CurrencyDefaults but for Payed From entries
export default function PayedFromDefaults() {
  const { tokens } = useAuth();
  const [payedFrom, setPayedFrom] = useState<string[]>([]);
  const [newPayedFrom, setNewPayedFrom] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [toast, setToast] = useState<{
    message: string;
    type: "success" | "error";
  } | null>(null);

  useEffect(() => {
    if (tokens?.accessToken) {
      loadPayedFromDefaults();
    }
  }, [tokens]);

  const loadPayedFromDefaults = async () => {
    try {
      setIsLoading(true);
      const data = await getPayedFromDefaults(tokens?.accessToken!);
      setPayedFrom(data);
    } catch (error) {
      setToast({ message: "Failed to load defaults", type: "error" });
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddPayedFrom = async () => {
    if (!newPayedFrom.trim()) return;

    try {
      const updatedList = await addPayedFromDefault(
        newPayedFrom.trim(),
        tokens?.accessToken!
      );
      setPayedFrom(updatedList);
      setNewPayedFrom("");
      setToast({ message: "Default added successfully", type: "success" });
    } catch (error) {
      setToast({ message: "Failed to add default", type: "error" });
    }
  };

  const handleRemovePayedFrom = async (pay: string) => {
    try {
      const updatedList = await deletePayedFromDefault(
        pay,
        tokens?.accessToken!
      );
      setPayedFrom(updatedList);
      setToast({ message: "Default removed successfully", type: "success" });
    } catch (error) {
      setToast({ message: "Failed to remove default", type: "error" });
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
          type="text"
          value={newPayedFrom}
          onChange={(e) => setNewPayedFrom(e.target.value)}
          placeholder="Add new payed from default..."
          className="flex-1 p-2 border rounded-md dark:bg-gray-800"
        />
        <button
          onClick={handleAddPayedFrom}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
        >
          Add
        </button>
      </div>

      <div className="space-y-2">
        {payedFrom.map((pay) => (
          <div
            key={pay}
            className="flex justify-between items-center p-3 bg-white dark:bg-gray-800 rounded-lg shadow"
          >
            <span>{pay}</span>
            <button
              onClick={() => handleRemovePayedFrom(pay)}
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
