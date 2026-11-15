import type { Metadata } from "next";
import { requireUser } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { mapBill } from "@/lib/supabase/records";
import { serializeBill } from "@/lib/dashboard";
import { BillsClient } from "@/components/bills/bills-client";

export const metadata: Metadata = {
  title: "Bills",
  robots: { index: false, follow: false },
};

export default async function BillsPage() {
  const user = await requireUser();
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("bills")
    .select("*")
    .eq("user_id", user.id)
    .order("due_date", { ascending: true });
  if (error) throw error;
  const bills = (data ?? []).map(mapBill);

  return (
    <BillsClient
      bills={bills.map(serializeBill)}
      currency={user.currency}
      defaultLeadDays={user.leadDays}
    />
  );
}
