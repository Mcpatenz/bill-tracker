import type { Metadata } from "next";
import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { serializeBill } from "@/lib/dashboard";
import { BillsClient } from "@/components/bills/bills-client";

export const metadata: Metadata = {
  title: "Bills",
  robots: { index: false, follow: false },
};

export default async function BillsPage() {
  const user = await requireUser();
  const bills = await prisma.bill.findMany({
    where: { userId: user.id },
    orderBy: { dueDate: "asc" },
  });

  return (
    <BillsClient
      bills={bills.map(serializeBill)}
      currency={user.currency}
      defaultLeadDays={user.leadDays}
    />
  );
}
