"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useAuth } from "../contexts/AuthContext";
import {
  getPayments,
  deletePayment,
  getSharedUserPayments,
} from "../services/paymentService";
import { Payment } from "../types/payment";
import Navbar from "../components/navigation/Navbar";
import { Toast } from "../components/ui/Toast";
import { ConfirmDialog } from "../components/ui/ConfirmDialog";
import { DateFilter } from "../components/ui/DateFilter";
import { getSharedToMeUsers } from "../services/defaultsService";

export default function Payments() {
  const { user, tokens } = useAuth();
  const [payments, setPayments] = useState<Payment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [showScrollTop, setShowScrollTop] = useState(false);
  const refreshTimerRef = useRef<NodeJS.Timeout>();
  const pullStartY = useRef(0);
  const mainRef = useRef<HTMLDivElement>(null);
  const [toast, setToast] = useState<{
    message: string;
    type: "success" | "error" | "info";
  } | null>(null);
  const [confirmDialog, setConfirmDialog] = useState<{
    isOpen: boolean;
    paymentId: string;
  }>({ isOpen: false, paymentId: "" });
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [filterCurrency, setFilterCurrency] = useState<string>("");
  const [selectedMonth, setSelectedMonth] = useState("");
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const observerTarget = useRef<HTMLDivElement>(null);
  const [selectedUser, setSelectedUser] = useState<string | null>(null);
  const [sharedUsers, setSharedUsers] = useState<string[]>([]);

  const fetchPayments = async (pageNum: number, append: boolean = false) => {
    try {
      if (!tokens?.accessToken) throw new Error("Not authenticated");
      if (append) {
        setIsLoadingMore(true);
      } else {
        setIsLoading(true);
      }

      let data;
      if (!selectedUser) {
        // When selectedUser is null (My Payments selected)
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/payment?page=${pageNum}&size=20`,
          {
            headers: {
              Authorization: `Bearer ${tokens.accessToken}`,
            },
          }
        );

        if (!response.ok) throw new Error("Failed to fetch my payments");
        data = await response.json();
      } else {
        // When a user is selected (viewing their payments)
        const response = await getSharedUserPayments(
          selectedUser,
          pageNum,
          tokens.accessToken
        );
        data = response.data;
      }

      if (append) {
        setPayments((prev) => [...prev, ...data]);
      } else {
        setPayments(data);
      }

      setHasMore(data.length === 20);
      setError("");
    } catch (err) {
      setError("Failed to fetch payments");
      console.error(err);
    } finally {
      setIsLoading(false);
      setIsLoadingMore(false);
      setIsRefreshing(false);
    }
  };

  // Scroll to top functionality
  useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 400);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Pull to refresh functionality
  const handleTouchStart = (e: React.TouchEvent) => {
    pullStartY.current = e.touches[0].clientY;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    const touch = e.touches[0].clientY;
    const pull = touch - pullStartY.current;

    if (window.scrollY === 0 && pull > 0) {
      e.preventDefault();
      if (pull > 100 && !isRefreshing) {
        setIsRefreshing(true);
        fetchPayments(1, false);
      }
    }
  };

  // Infinite scroll observer
  const observer = useRef<IntersectionObserver>();
  const lastPaymentRef = useCallback(
    (node: HTMLDivElement) => {
      if (isLoadingMore || !hasMore) return;
      if (observer.current) observer.current.disconnect();

      observer.current = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting && hasMore) {
          setPage((prevPage) => {
            const nextPage = prevPage + 1;
            fetchPayments(nextPage, true);
            return nextPage;
          });
        }
      });

      if (node) observer.current.observe(node);
    },
    [hasMore, isLoadingMore, fetchPayments]
  );

  // Initial load
  useEffect(() => {
    if (tokens?.accessToken) {
      setPage(1);
      fetchPayments(1, false);
    }
  }, [tokens, selectedMonth, filterCurrency]); // Reset and refetch when filters change

  // Helper function to check if a date is within selected month
  const isDateInSelectedMonth = (dateString: string) => {
    if (!selectedMonth) return true;
    const date = new Date(dateString);
    // Format the date to YYYY-MM format with correction for 0-based months
    const monthYear = `${date.getFullYear()}-${String(
      date.getMonth() + 1
    ).padStart(2, "0")}`;
    return monthYear === selectedMonth;
  };

  // Group payments by date and filter by month
  const groupedPayments = payments.reduce((groups, payment) => {
    if (!isDateInSelectedMonth(payment.date)) return groups;

    const date = new Date(payment.date);

    // Always format date string with year
    const dateString = date.toLocaleDateString(undefined, {
      month: "long",
      day: "numeric",
      year: "numeric", // Always include year
    });

    if (!groups[dateString]) {
      groups[dateString] = [];
    }
    groups[dateString].push(payment);
    return groups;
  }, {} as Record<string, Payment[]>);

  // Sort dates with year consideration
  const sortedDates = Object.keys(groupedPayments).sort((a, b) => {
    const dateA = new Date(groupedPayments[a][0].date).getTime();
    const dateB = new Date(groupedPayments[b][0].date).getTime();
    return sortOrder === "asc" ? dateA - dateB : dateB - dateA;
  });

  const handleDelete = async (paymentId: string) => {
    setConfirmDialog({ isOpen: true, paymentId });
  };

  const confirmDelete = async () => {
    try {
      if (!tokens?.accessToken) throw new Error("Not authenticated");
      await deletePayment(confirmDialog.paymentId, tokens.accessToken);
      setToast({ message: "Payment deleted successfully", type: "success" });
      fetchPayments(1, false);
    } catch (err) {
      setError("Failed to delete payment");
      setToast({ message: "Failed to delete payment", type: "error" });
      console.error(err);
    }
  };

  const handleRetry = () => {
    setError("");
    fetchPayments(1, false);
  };

  const loadMorePayments = async () => {
    if (isLoadingMore || !hasMore) return;

    try {
      setIsLoadingMore(true);
      const nextPage = page + 1;

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/payment?page=${nextPage}&size=10`,
        {
          headers: {
            Authorization: `Bearer ${tokens?.accessToken}`,
          },
        }
      );

      if (!response.ok) throw new Error("Failed to fetch more payments");

      const newPayments = await response.json();

      if (newPayments.length === 0) {
        setHasMore(false);
        return;
      }

      setPayments((prev) => [...prev, ...newPayments]);
      setPage(nextPage);
      setHasMore(newPayments.length === 10);
    } catch (error) {
      console.error("Error loading more payments:", error);
      setToast({
        message: "Failed to load more payments",
        type: "error",
      });
    } finally {
      setIsLoadingMore(false);
    }
  };

  // Initial load
  const loadInitialPayments = async () => {
    try {
      setIsLoading(true);
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/payment?page=1&size=10`,
        {
          headers: {
            Authorization: `Bearer ${tokens?.accessToken}`,
          },
        }
      );

      if (!response.ok) throw new Error("Failed to fetch payments");

      const data = await response.json();
      setPayments(data);
      setHasMore(data.length === 10);
      setPage(1);
    } catch (error) {
      console.error("Error loading payments:", error);
      setToast({
        message: "Failed to load payments",
        type: "error",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Set up intersection observer
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !isLoadingMore && hasMore) {
          loadMorePayments();
        }
      },
      { threshold: 0.1 }
    );

    const currentTarget = observerTarget.current;
    if (currentTarget) {
      observer.observe(currentTarget);
    }

    return () => {
      if (currentTarget) {
        observer.unobserve(currentTarget);
      }
    };
  }, [isLoadingMore, hasMore, page]);

  // Load initial data
  useEffect(() => {
    if (tokens?.accessToken) {
      loadInitialPayments();
    }
  }, [tokens?.accessToken, selectedMonth, filterCurrency]);

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
    } catch (error) {
      console.error("Failed to load shared users:", error);
      setToast({
        message: "Failed to load users sharing with you",
        type: "error",
      });
    }
  };

  // Update the user selection handler to properly handle the email
  const handleUserChange = (selected: string | null) => {
    let email = null;
    if (selected) {
      // Remove "'s Payments" from the end to get the email
      email = selected.replace("'s Payments", "");
    }

    console.log("Selected user email:", email); // Debug log
    setSelectedUser(email);
    setPage(1);
    setPayments([]);
    fetchPayments(1, false);
  };

  if (!user) {
    return null;
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div
      className="min-h-screen bg-background pb-16"
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
    >
      <main ref={mainRef} className="container mx-auto px-4 py-8">
        {/* Pull to refresh indicator */}
        {isRefreshing && (
          <div className="flex justify-center items-center h-10 -mt-4 mb-4">
            <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        )}

        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
          <h1 className="text-2xl font-bold">Payments History</h1>
          <div className="flex flex-wrap gap-4 w-full sm:w-auto">
            <select
              value={selectedUser ? `${selectedUser}'s Payments` : ""}
              onChange={(e) => handleUserChange(e.target.value || null)}
              className="px-3 py-2 border rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
            >
              <option value="">My Payments</option>
              {sharedUsers.map((email) => (
                <option key={email} value={`${email}'s Payments`}>
                  {email}'s Payments
                </option>
              ))}
            </select>
            <DateFilter
              selectedMonth={selectedMonth}
              onMonthChange={setSelectedMonth}
            />
            <select
              value={filterCurrency}
              onChange={(e) => setFilterCurrency(e.target.value)}
              className="px-3 py-2 border rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
            >
              <option value="">All Currencies</option>
              <option value="INR">INR</option>
              <option value="USD">USD</option>
              <option value="EUR">EUR</option>
              <option value="GBP">GBP</option>
            </select>
            <button
              onClick={() =>
                setSortOrder((prev) => (prev === "asc" ? "desc" : "asc"))
              }
              className="flex items-center gap-2 px-3 py-2 border rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
            >
              <span>Sort by Date</span>
              <span className="text-lg">{sortOrder === "asc" ? "↑" : "↓"}</span>
            </button>
          </div>
        </div>

        {/* Show selected filters */}
        {(selectedMonth || filterCurrency) && (
          <div className="flex flex-wrap gap-2 mb-4">
            {selectedMonth && (
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded-full text-sm">
                {new Date(selectedMonth).toLocaleString("default", {
                  year: "numeric",
                  month: "long",
                })}
                <button
                  onClick={() => setSelectedMonth("")}
                  className="hover:text-blue-600 dark:hover:text-blue-400"
                >
                  ×
                </button>
              </div>
            )}
            {filterCurrency && (
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded-full text-sm">
                {filterCurrency}
                <button
                  onClick={() => setFilterCurrency("")}
                  className="hover:text-blue-600 dark:hover:text-blue-400"
                >
                  ×
                </button>
              </div>
            )}
          </div>
        )}

        <div className="space-y-8">
          {sortedDates.map((date, dateIndex) => (
            <div key={date}>
              <div className="relative py-4">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-300 dark:border-gray-700"></div>
                </div>
                <div className="relative flex justify-center">
                  <span className="px-3 bg-background text-sm text-gray-500">
                    {date}
                  </span>
                </div>
              </div>

              <div className="space-y-4">
                {groupedPayments[date]
                  .filter(
                    (payment) =>
                      !filterCurrency || payment.currency === filterCurrency
                  )
                  .map((payment, index) => {
                    const isLastPayment =
                      dateIndex === sortedDates.length - 1 &&
                      index === groupedPayments[date].length - 1;

                    return (
                      <div
                        key={payment.id}
                        ref={isLastPayment ? lastPaymentRef : undefined}
                        className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow flex justify-between items-center transform transition-all duration-200 hover:scale-[1.02]"
                      >
                        <div>
                          <p className="font-medium">
                            {payment.amount} {payment.currency}
                          </p>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            From: {payment.payedFrom}
                          </p>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            To: {payment.payedTo}
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-500">
                            {new Date(payment.date).toLocaleTimeString(
                              undefined,
                              {
                                hour: "2-digit",
                                minute: "2-digit",
                              }
                            )}
                          </p>
                        </div>
                        <button
                          onClick={() => handleDelete(payment.id)}
                          className="text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 transition-colors"
                        >
                          Delete
                        </button>
                      </div>
                    );
                  })}
              </div>
            </div>
          ))}

          {/* Loading indicator and observer target */}
          <div ref={observerTarget} className="h-4 w-full">
            {isLoadingMore && (
              <div className="flex justify-center py-4">
                <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-blue-500"></div>
              </div>
            )}
          </div>

          {!isLoading && !isLoadingMore && payments.length === 0 && (
            <div className="text-center text-gray-500 mt-8">
              <p className="mb-2">No payments found</p>
              {(selectedMonth || filterCurrency) && (
                <button
                  onClick={() => {
                    setSelectedMonth("");
                    setFilterCurrency("");
                  }}
                  className="text-blue-500 hover:text-blue-600 dark:text-blue-400 dark:hover:text-blue-300"
                >
                  Clear all filters
                </button>
              )}
            </div>
          )}
        </div>
      </main>

      {/* Scroll to top button */}
      {showScrollTop && (
        <button
          onClick={scrollToTop}
          className="fixed bottom-20 right-4 bg-blue-600 text-white p-3 rounded-full shadow-lg hover:bg-blue-700 transition-all duration-200 transform hover:scale-110"
          aria-label="Scroll to top"
        >
          <svg
            className="w-6 h-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M5 10l7-7m0 0l7 7m-7-7v18"
            />
          </svg>
        </button>
      )}

      <ConfirmDialog
        isOpen={confirmDialog.isOpen}
        onClose={() => setConfirmDialog({ isOpen: false, paymentId: "" })}
        onConfirm={confirmDelete}
        title="Delete Payment"
        message="Are you sure you want to delete this payment? This action cannot be undone."
      />

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
