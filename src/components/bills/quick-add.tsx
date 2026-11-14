"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { BillFormModal } from "@/components/bills/bill-form";

export function QuickAdd({
  currency,
  defaultLeadDays,
  label = "Add bill",
  variant = "primary",
  size = "md",
  className,
}: {
  currency: string;
  defaultLeadDays?: number;
  label?: string;
  variant?: "primary" | "secondary" | "mint";
  size?: "sm" | "md" | "lg";
  className?: string;
}) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Button
        variant={variant}
        size={size}
        className={className}
        onClick={() => setOpen(true)}
        iconLeft={<Plus className="size-4" />}
      >
        {label}
      </Button>
      <BillFormModal
        open={open}
        onClose={() => setOpen(false)}
        currency={currency}
        defaultLeadDays={defaultLeadDays}
      />
    </>
  );
}
