type Table<Row extends Record<string, unknown>> = {
  Row: Row;
  Insert: Partial<Row>;
  Update: Partial<Row>;
  Relationships: [];
};

type ProfileRow = {
  id: string;
  email: string;
  name: string;
  is_admin: boolean;
  avatar: string | null;
  notify_email: string | null;
  currency: string;
  lead_days: number;
  created_at: string;
  updated_at: string;
};

type BillRow = {
  id: string;
  user_id: string;
  name: string;
  amount: number;
  category: string;
  due_date: string;
  recurrence: string;
  notes: string | null;
  is_paid: boolean;
  paid_at: string | null;
  reminder_days_before: number;
  last_notified_at: string | null;
  created_at: string;
  updated_at: string;
};

type PaymentRow = {
  id: string;
  user_id: string;
  bill_id: string | null;
  amount: number;
  due_date: string;
  paid_at: string;
  method: string;
};

type NotificationRow = {
  id: string;
  user_id: string;
  bill_id: string | null;
  title: string;
  body: string;
  channel: string;
  read_at: string | null;
  created_at: string;
};

export type Database = {
  __InternalSupabase: { PostgrestVersion: "14.18" };
  public: {
    Tables: {
      profiles: Table<ProfileRow>;
      bills: Table<BillRow>;
      payments: Table<PaymentRow>;
      notifications: Table<NotificationRow>;
    };
    Views: Record<string, never>;
    Functions: {
      admin_delete_user: {
        Args: { target_user_id: string };
        Returns: undefined;
      };
    };
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
};

export type Profile = ProfileRow;
export type Bill = BillRow;
export type Payment = PaymentRow;
export type Notification = NotificationRow;
