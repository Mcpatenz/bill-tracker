export function formatCurrency(amount: number, currency = "PHP"): string {
  try {
    return new Intl.NumberFormat("en-PH", {
      style: "currency",
      currency,
      minimumFractionDigits: amount % 1 === 0 ? 0 : 2,
      maximumFractionDigits: 2,
    }).format(amount);
  } catch {
    return `${currency} ${amount.toFixed(2)}`;
  }
}

export function formatCompactCurrency(amount: number, currency = "PHP"): string {
  try {
    return new Intl.NumberFormat("en-PH", {
      style: "currency",
      currency,
      notation: "compact",
      maximumFractionDigits: 1,
    }).format(amount);
  } catch {
    return `${currency} ${amount.toFixed(0)}`;
  }
}

export function initials(name: string): string {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");
}

export function formatStatNumber(value: number): string {
  return new Intl.NumberFormat("en-US").format(value);
}

export function formatStatRate(value: number | null): string {
  return value === null ? "—" : `${value.toFixed(1)}%`;
}
