# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

- `npm run dev` — Start dev server at localhost:3000
- `npm run build` — Production build
- `npm run lint` — ESLint (next/core-web-vitals + next/typescript)
- No test runner configured

## Architecture

Client-side expense tracking app built with **Next.js 14 App Router**, **React 18**, **TypeScript** (strict mode). All data persists in browser **localStorage** — there is no backend or database.

### Routing

- `/` — Dashboard: summary cards, charts (recharts), quick-add form
- `/expenses` — Full CRUD: expense list with search, category/sort filters, edit/delete

### Key directories

- `src/components/` — Client components (`"use client"`): AppShell, Sidebar, Charts, ExpenseForm, ExpenseList, SummaryCards
- `src/lib/` — Business logic: `types.ts` (Expense interface, Category union, constants), `storage.ts` (localStorage read/write), `useExpenses.ts` (central state hook), `utils.ts` (helpers)

### State management

All expense state lives in the `useExpenses` custom hook (`src/lib/useExpenses.ts`). It handles CRUD operations and syncs to localStorage on every change. Components consume this hook — no external state library.

### Data model

```typescript
type Category = "Food" | "Transportation" | "Entertainment" | "Shopping" | "Bills" | "Other";

interface Expense {
  id: string;        // UUID (uuid package)
  amount: number;
  category: Category;
  description: string;
  date: string;      // YYYY-MM-DD
  createdAt: string; // ISO datetime
}
```

## Conventions

- Path alias: `@/*` maps to `./src/*`
- Styling: Tailwind CSS utility-first; indigo as primary color; category-specific color constants in `CATEGORY_COLORS`
- All interactive components require `"use client"` directive
- Date handling uses `date-fns`
- IDs generated with `uuid` v13
