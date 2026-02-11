export type Category =
  | "Food"
  | "Transportation"
  | "Entertainment"
  | "Shopping"
  | "Bills"
  | "Other";

export const CATEGORIES: Category[] = [
  "Food",
  "Transportation",
  "Entertainment",
  "Shopping",
  "Bills",
  "Other",
];

export const CATEGORY_COLORS: Record<Category, string> = {
  Food: "#f97316",
  Transportation: "#3b82f6",
  Entertainment: "#a855f7",
  Shopping: "#ec4899",
  Bills: "#eab308",
  Other: "#6b7280",
};

export const CATEGORY_ICONS: Record<Category, string> = {
  Food: "🍔",
  Transportation: "🚗",
  Entertainment: "🎬",
  Shopping: "🛍️",
  Bills: "📄",
  Other: "📌",
};

export interface Expense {
  id: string;
  amount: number;
  category: Category;
  description: string;
  date: string; // ISO date string YYYY-MM-DD
  createdAt: string; // ISO datetime
}

export interface ExpenseFormData {
  amount: string;
  category: Category;
  description: string;
  date: string;
}

export interface FilterState {
  search: string;
  category: Category | "All";
  dateFrom: string;
  dateTo: string;
  sortBy: "date" | "amount" | "category";
  sortOrder: "asc" | "desc";
}
