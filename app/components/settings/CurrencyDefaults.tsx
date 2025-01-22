"use client";

import { useState, useEffect } from "react";
import { useAuth } from "../../contexts/AuthContext";
import { Toast } from "../ui/Toast";

export default function CurrencyDefaults() {
  const { tokens } = useAuth();
  const [currencies, setCurrencies] = useState<string[]>([]);
  const [newCurrency, setNewCurrency] = useState("");
  const [toast, setToast] = useState<{
    message: string;
    type: "success" | "error";
  } | null>(null);

  const handleAddCurrency = async () => {
    if (!newCurrency.trim()) return;

    try {
      // Add API call here
      setCurrencies([...currencies, newCurrency.trim()]);
      setNewCurrency("");
      setToast({ message: "Currency added successfully", type: "success" });
    } catch (error) {
      setToast({ message: "Failed to add currency", type: "error" });
    }
  };

  const handleRemoveCurrency = async (currency: string) => {
    try {
      // Add API call here
      setCurrencies(currencies.filter((c) => c !== currency));
      setToast({ message: "Currency removed successfully", type: "success" });
    } catch (error) {
      setToast({ message: "Failed to remove currency", type: "error" });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex gap-4">
        <input
          type="text"
          value={newCurrency}
          onChange={(e) => setNewCurrency(e.target.value)}
          placeholder="Add new currency..."
          className="flex-1 p-2 border rounded-md dark:bg-gray-800"
        />
        <button
          onClick={handleAddCurrency}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
        >
          Add
        </button>
      </div>

      <div className="space-y-2">
        {currencies.map((currency) => (
          <div
            key={currency}
            className="flex justify-between items-center p-3 bg-white dark:bg-gray-800 rounded-lg shadow"
          >
            <span>{currency}</span>
            <button
              onClick={() => handleRemoveCurrency(currency)}
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
