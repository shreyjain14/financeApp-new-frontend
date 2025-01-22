"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "./contexts/AuthContext";
import { createPayment } from "./services/paymentService";
import {
  getPayedToDefaults,
  getPayedFromDefaults,
} from "./services/defaultsService";
import Navbar from "./components/navigation/Navbar";

// Add currency symbol mapping
const currencySymbols: { [key: string]: string } = {
  INR: "₹",
  USD: "$",
  EUR: "€",
  GBP: "£",
};

export default function Home() {
  const router = useRouter();
  const { user, isLoading, tokens } = useAuth();
  const [formData, setFormData] = useState({
    amount: "",
    currency: "INR",
    payedFrom: "",
    payedTo: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [currency, setCurrency] = useState("INR");
  const [payedToOptions, setPayedToOptions] = useState<string[]>([]);
  const [payedFromOptions, setPayedFromOptions] = useState<string[]>([]);
  const [isOtherPayedTo, setIsOtherPayedTo] = useState(false);

  useEffect(() => {
    if (!isLoading && !user) {
      router.push("/login");
    }
  }, [user, isLoading, router]);

  // Fetch defaults when component mounts
  useEffect(() => {
    if (tokens?.accessToken) {
      loadDefaults();
    }
  }, [tokens]);

  const loadDefaults = async () => {
    try {
      const [toDefaults, fromDefaults] = await Promise.all([
        getPayedToDefaults(tokens?.accessToken!),
        getPayedFromDefaults(tokens?.accessToken!),
      ]);
      setPayedToOptions(toDefaults);
      setPayedFromOptions(fromDefaults);

      // Set first options as default values if available
      if (toDefaults.length > 0) {
        setFormData((prev) => ({ ...prev, payedTo: toDefaults[0] }));
      }
      if (fromDefaults.length > 0) {
        setFormData((prev) => ({ ...prev, payedFrom: fromDefaults[0] }));
      }
    } catch (error) {
      console.error("Failed to load defaults:", error);
    }
  };

  const handlePayedToChange = (value: string) => {
    if (value === "other") {
      setIsOtherPayedTo(true);
      setFormData({ ...formData, payedTo: "" });
    } else {
      setIsOtherPayedTo(false);
      setFormData({ ...formData, payedTo: value });
    }
  };

  const handlePayedFromChange = (value: string) => {
    setFormData({ ...formData, payedFrom: value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsSubmitting(true);

    try {
      if (!tokens?.accessToken) throw new Error("Not authenticated");

      await createPayment(
        {
          amount: parseFloat(formData.amount),
          currency: formData.currency,
          payedFrom: formData.payedFrom,
          payedTo: formData.payedTo,
        },
        tokens.accessToken
      );

      // Reset form
      setFormData({
        amount: "",
        currency: "INR",
        payedFrom: "",
        payedTo: "",
      });
    } catch (err) {
      setError("Failed to create payment");
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background pb-16">
      <main className="container mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold mb-8">Add Payment</h1>

        <form onSubmit={handleSubmit} className="max-w-md space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
              Amount
            </label>
            <div className="flex gap-2">
              <select
                value={formData.currency}
                onChange={(e) =>
                  setFormData({ ...formData, currency: e.target.value })
                }
                className="w-24 p-2 border rounded-md bg-white dark:bg-gray-800"
                required
              >
                <option value="INR">INR</option>
                <option value="USD">USD</option>
                <option value="EUR">EUR</option>
                <option value="GBP">GBP</option>
              </select>
              <div className="relative flex-1">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">
                  {currencySymbols[formData.currency]}
                </span>
                <input
                  type="number"
                  step="0.01"
                  value={formData.amount}
                  onChange={(e) =>
                    setFormData({ ...formData, amount: e.target.value })
                  }
                  className="w-full p-2 pl-7 border rounded-md bg-white dark:bg-gray-800"
                  required
                />
              </div>
            </div>
          </div>

          <div>
            <label
              htmlFor="payedFrom"
              className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2"
            >
              Payed From
            </label>
            <select
              id="payedFrom"
              value={formData.payedFrom}
              onChange={(e) => handlePayedFromChange(e.target.value)}
              className="w-full p-2 border rounded-md bg-white dark:bg-gray-800"
              required
            >
              {payedFromOptions.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label
              htmlFor="payedTo"
              className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2"
            >
              Payed To
            </label>
            <select
              id="payedTo"
              value={isOtherPayedTo ? "other" : formData.payedTo}
              onChange={(e) => handlePayedToChange(e.target.value)}
              className="w-full p-2 border rounded-md bg-white dark:bg-gray-800 mb-2"
              required
            >
              {payedToOptions.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
              <option value="other">Other</option>
            </select>
            {isOtherPayedTo && (
              <input
                type="text"
                value={formData.payedTo}
                onChange={(e) =>
                  setFormData({ ...formData, payedTo: e.target.value })
                }
                placeholder="Enter custom payed to"
                className="w-full p-2 border rounded-md bg-white dark:bg-gray-800"
                required
              />
            )}
          </div>

          {error && <p className="text-red-500 text-sm">{error}</p>}

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:opacity-50"
          >
            {isSubmitting ? "Adding Payment..." : "Add Payment"}
          </button>
        </form>
      </main>

      <Navbar />
    </div>
  );
}
