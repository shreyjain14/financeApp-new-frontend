"use client";

import { useState, useEffect } from "react";
import { useAuth } from "../contexts/AuthContext";
import { getAISummary } from "../services/summaryService";
import Navbar from "../components/navigation/Navbar";
import { Toast } from "../components/ui/Toast";
import ReactMarkdown from "react-markdown";

interface AISummaryResponse {
  response: string;
}

export default function AISummary() {
  const { user, tokens } = useAuth();
  const [summary, setSummary] = useState<string>("");
  const [isLoading, setIsLoading] = useState(true);
  const [toast, setToast] = useState<{
    message: string;
    type: "success" | "error" | "info";
  } | null>(null);

  useEffect(() => {
    if (tokens?.accessToken) {
      fetchSummary();
    }
  }, [tokens]);

  const fetchSummary = async () => {
    try {
      setIsLoading(true);
      const data = await getAISummary(tokens?.accessToken!);
      setSummary(data.response); // Access the response property
    } catch (error) {
      console.error("Failed to fetch AI summary:", error);
      setToast({
        message: "Failed to fetch AI summary",
        type: "error",
      });
    } finally {
      setIsLoading(false);
    }
  };

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
        <div className="mb-8">
          <h1 className="text-2xl font-bold">AI Summary</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Smart insights about your payments
          </p>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
          {summary ? (
            <div className="prose dark:prose-invert max-w-none">
              <ReactMarkdown>{summary}</ReactMarkdown>
            </div>
          ) : (
            <div className="text-center text-gray-500">
              No summary available
            </div>
          )}
        </div>

        <button
          onClick={fetchSummary}
          className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
        >
          Refresh Summary
        </button>
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
