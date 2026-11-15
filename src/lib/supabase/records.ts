import type { Bill as BillRow, Notification as NotificationRow, Payment as PaymentRow, Profile as ProfileRow } from "@/types/database";

export type UserRecord = {
  id: string;
  name: string;
  email: string;
  role: "ADMIN" | "USER";
  avatar: string | null;
  notifyEmail: string | null;
  currency: string;
  leadDays: number;
  createdAt: Date;
};

export type BillRecord = {
  id: string;
  userId: string;
  name: string;
  amount: number;
  category: string;
  dueDate: Date;
  recurrence: string;
  notes: string | null;
  isPaid: boolean;
  paidAt: Date | null;
  reminderDaysBefore: number;
  lastNotifiedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
};

export type PaymentRecord = {
  id: string;
  userId: string;
  billId: string | null;
  amount: number;
  dueDate: Date;
  paidAt: Date;
  method: string;
};

export type NotificationRecord = {
  id: string;
  userId: string;
  billId: string | null;
  title: string;
  body: string;
  channel: string;
  readAt: Date | null;
  createdAt: Date;
};

export function mapProfile(row: ProfileRow, email = row.email): UserRecord {
  return {
    id: row.id,
    name: row.name,
    email,
    role: row.is_admin ? "ADMIN" : "USER",
    avatar: row.avatar,
    notifyEmail: row.notify_email,
    currency: row.currency,
    leadDays: row.lead_days,
    createdAt: new Date(row.created_at),
  };
}

export function mapBill(row: BillRow): BillRecord {
  return {
    id: row.id,
    userId: row.user_id,
    name: row.name,
    amount: row.amount,
    category: row.category,
    dueDate: new Date(row.due_date),
    recurrence: row.recurrence,
    notes: row.notes,
    isPaid: row.is_paid,
    paidAt: row.paid_at ? new Date(row.paid_at) : null,
    reminderDaysBefore: row.reminder_days_before,
    lastNotifiedAt: row.last_notified_at ? new Date(row.last_notified_at) : null,
    createdAt: new Date(row.created_at),
    updatedAt: new Date(row.updated_at),
  };
}

export function mapPayment(row: PaymentRow): PaymentRecord {
  return {
    id: row.id,
    userId: row.user_id,
    billId: row.bill_id,
    amount: row.amount,
    dueDate: new Date(row.due_date),
    paidAt: new Date(row.paid_at),
    method: row.method,
  };
}

export function mapNotification(row: NotificationRow): NotificationRecord {
  return {
    id: row.id,
    userId: row.user_id,
    billId: row.bill_id,
    title: row.title,
    body: row.body,
    channel: row.channel,
    readAt: row.read_at ? new Date(row.read_at) : null,
    createdAt: new Date(row.created_at),
  };
}
