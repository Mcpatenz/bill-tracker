import {
  Car,
  CirclePlay,
  CreditCard,
  GraduationCap,
  HeartPulse,
  Home,
  Package,
  ShieldCheck,
  Wifi,
  Zap,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { categoryMeta } from "@/lib/constants";

const icons: Record<string, LucideIcon> = {
  Home,
  Zap,
  Wifi,
  ShieldCheck,
  CirclePlay,
  CreditCard,
  Car,
  HeartPulse,
  GraduationCap,
  Package,
};

export function CategoryIcon({
  category,
  className,
  badge = true,
}: {
  category: string;
  className?: string;
  badge?: boolean;
}) {
  const meta = categoryMeta(category);
  const Icon = icons[meta.icon] ?? Package;

  if (!badge) return <Icon className={className} style={{ color: meta.color }} />;

  return (
    <span
      className="inline-flex size-10 shrink-0 items-center justify-center rounded-xl border"
      style={{
        backgroundColor: `${meta.color}14`,
        borderColor: `${meta.color}2e`,
        color: meta.color,
      }}
    >
      <Icon className={className ?? "size-4.5"} />
    </span>
  );
}
