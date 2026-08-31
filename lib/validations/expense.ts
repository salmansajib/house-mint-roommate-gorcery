import { z } from "zod";

export const expenseCategorySchema = z.enum([
  "groceries",
  "rent",
  "internet",
  "gas",
  "electricity",
  "other",
]);

export const splitTypeSchema = z.enum(["equal", "full", "ratio", "custom"]);

export const expenseItemSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(1, "Item name is required"),
  quantity: z.number().min(0.01).optional(),
  unit: z.string().optional(),
  unit_price: z.number().min(0, "Unit price cannot be negative"),
  total_price: z.number().min(0, "Total price cannot be negative"),
  assigned_to: z.string().nullable().optional(),
});

export const splitShareSchema = z.object({
  user_id: z.string().min(1, "User is required"),
  amount: z.number().min(0, "Share amount cannot be negative"),
  percentage: z.number().min(0).max(100).optional(),
});

// Single-amount bill schema (Rent, Utilities, Internet, etc.)
export const singleExpenseFormSchema = z.object({
  title: z.string().min(2, "Title must be at least 2 characters").max(100),
  category: expenseCategorySchema,
  amount: z.coerce.number().positive("Amount must be greater than ৳0"),
  quantity: z.coerce.number().min(0.01).optional(),
  unit: z.string().optional(),
  paid_by: z.string().min(1, "Please select who paid"),
  date: z.string().min(1, "Date is required"),
  split_type: splitTypeSchema.default("equal"),
  is_recurring: z.boolean().default(false),
  notes: z.string().max(300).optional(),
  custom_splits: z.array(splitShareSchema).optional(),
});

// Itemized grocery expense schema
export const itemizedExpenseFormSchema = z.object({
  title: z.string().min(2, "Title is required").default("Grocery Shopping"),
  category: expenseCategorySchema.default("groceries"),
  paid_by: z.string().min(1, "Please select who paid"),
  date: z.string().min(1, "Date is required"),
  split_type: splitTypeSchema.default("equal"),
  notes: z.string().max(300).optional(),
  items: z
    .array(expenseItemSchema)
    .min(1, "At least one grocery item is required"),
  custom_splits: z.array(splitShareSchema).optional(),
});

export type SingleExpenseFormValues = z.infer<typeof singleExpenseFormSchema>;
export type ItemizedExpenseFormValues = z.infer<typeof itemizedExpenseFormSchema>;
export type ExpenseItemValues = z.infer<typeof expenseItemSchema>;
