"use client";

import { useState, useEffect, useCallback } from "react";
import { v4 as uuidv4 } from "uuid";
import { Expense, ExpenseFormData } from "./types";
import { loadExpenses, saveExpenses } from "./storage";

export function useExpenses() {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    setExpenses(loadExpenses());
    setLoaded(true);
  }, []);

  useEffect(() => {
    if (loaded) saveExpenses(expenses);
  }, [expenses, loaded]);

  const addExpense = useCallback((data: ExpenseFormData) => {
    const expense: Expense = {
      id: uuidv4(),
      amount: parseFloat(data.amount),
      category: data.category,
      description: data.description.trim(),
      date: data.date,
      createdAt: new Date().toISOString(),
    };
    setExpenses((prev) => [expense, ...prev]);
  }, []);

  const updateExpense = useCallback((id: string, data: ExpenseFormData) => {
    setExpenses((prev) =>
      prev.map((e) =>
        e.id === id
          ? {
              ...e,
              amount: parseFloat(data.amount),
              category: data.category,
              description: data.description.trim(),
              date: data.date,
            }
          : e
      )
    );
  }, []);

  const deleteExpense = useCallback((id: string) => {
    setExpenses((prev) => prev.filter((e) => e.id !== id));
  }, []);

  return { expenses, loaded, addExpense, updateExpense, deleteExpense };
}
