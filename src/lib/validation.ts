import { z } from "zod";
import { CATEGORY_VALUES, CURRENCIES } from "./constants";

export const registerSchema = z.object({
  name: z.string().trim().min(2, "Please enter your name").max(60),
  email: z.string().trim().email("Enter a valid email address").max(120),
  password: z.string().min(8, "Password must be at least 8 characters").max(72),
});

export const loginSchema = z.object({
  email: z.string().trim().email("Enter a valid email address").max(120),
  password: z.string().min(1, "Enter your password").max(72),
});

export const billSchema = z.object({
  name: z.string().trim().min(1, "Give your bill a name").max(80),
  amount: z.coerce.number().positive("Amount must be greater than zero").max(1_000_000_000),
  category: z.enum(CATEGORY_VALUES),
  dueDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Choose a due date"),
  recurrence: z.enum(["ONCE", "WEEKLY", "MONTHLY", "YEARLY"]),
  notes: z.string().trim().max(500).optional().nullable(),
  reminderDaysBefore: z.coerce.number().int().min(0).max(30),
});

export const billUpdateSchema = billSchema.partial();

export const settingsSchema = z.object({
  name: z.string().trim().min(2, "Please enter your name").max(60),
  avatar: z
    .string()
    .max(750_000, "Image is too large")
    .refine(
      (value) => value === "" || value.startsWith("data:image/") || /^https?:\/\//.test(value),
      "Choose a valid image",
    )
    .nullable()
    .optional(),
  notifyEmail: z.string().trim().email("Enter a valid email address").max(120).nullable().optional(),
  currency: z.enum(CURRENCIES),
  leadDays: z.coerce.number().int().min(0).max(30),
});

export const passwordSchema = z.object({
  currentPassword: z.string().min(1, "Enter your current password"),
  newPassword: z.string().min(8, "Password must be at least 8 characters").max(72),
});

export type BillInput = z.infer<typeof billSchema>;
export type SettingsInput = z.infer<typeof settingsSchema>;
