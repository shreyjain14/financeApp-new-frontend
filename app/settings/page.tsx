"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Navbar from "../components/navigation/Navbar";
import PayedToDefaults from "../components/settings/PayedToDefaults";
import PayedFromDefaults from "../components/settings/PayedFromDefaults";
import SharedUsers from "../components/settings/SharedUsers";
import { useAuth } from "../contexts/AuthContext";

type Tab = "payedTo" | "payedFrom" | "shared";

export default function Settings() {
  const router = useRouter();
  const { user, logout } = useAuth();
  const [activeTab, setActiveTab] = useState<Tab>("payedTo");

  useEffect(() => {
    if (!user) {
      router.push("/login");
    }
  }, [user, router]);

  const handleLogout = async () => {
    try {
      await logout();
      // The useEffect above will handle the redirect
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  if (!user) return null;

  const tabs = [
    { id: "payedTo" as Tab, label: "Payed To Defaults" },
    { id: "payedFrom" as Tab, label: "Payed From Defaults" },
    { id: "shared" as Tab, label: "Shared Users" },
  ];

  const renderContent = () => {
    switch (activeTab) {
      case "payedTo":
        return <PayedToDefaults />;
      case "payedFrom":
        return <PayedFromDefaults />;
      case "shared":
        return <SharedUsers />;
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-background pb-16">
      <main className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-2xl font-bold">Settings</h1>
          <button
            onClick={handleLogout}
            className="px-4 py-2 text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 transition-colors"
          >
            Logout
          </button>
        </div>

        {/* Tabs */}
        <div className="mb-8">
          <div className="border-b border-gray-200 dark:border-gray-700">
            <nav className="-mb-px flex space-x-8 overflow-x-auto">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`
                    whitespace-nowrap pb-4 px-1 border-b-2 font-medium text-sm
                    ${
                      activeTab === tab.id
                        ? "border-blue-500 text-blue-600 dark:text-blue-400"
                        : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300"
                    }
                  `}
                >
                  {tab.label}
                </button>
              ))}
            </nav>
          </div>
        </div>

        {/* Content */}
        <div className="mt-8">{renderContent()}</div>
      </main>

      <Navbar />
    </div>
  );
}
