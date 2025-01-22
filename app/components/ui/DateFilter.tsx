"use client";

interface DateFilterProps {
  onMonthChange: (month: string) => void;
  selectedMonth: string;
}

export function DateFilter({ onMonthChange, selectedMonth }: DateFilterProps) {
  // Generate last 12 months
  const getLastMonths = () => {
    const months = [];
    const today = new Date();

    for (let i = 0; i < 12; i++) {
      // Create date for the first of each month
      const date = new Date(today.getFullYear(), today.getMonth() - i + 1, 1);
      const monthString = date.toLocaleString("default", {
        year: "numeric",
        month: "long",
      });
      // Add 1 to month when creating the value to correct 0-based months
      const value = `${date.getFullYear()}-${String(
        date.getMonth() + 1
      ).padStart(2, "0")}`;
      months.push({ label: monthString, value });
    }

    return months;
  };

  return (
    <select
      value={selectedMonth}
      onChange={(e) => onMonthChange(e.target.value)}
      className="px-3 py-2 border rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
    >
      <option value="">All Time</option>
      {getLastMonths().map((month) => (
        <option key={month.value} value={month.value}>
          {month.label}
        </option>
      ))}
    </select>
  );
}
