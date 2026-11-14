export const CATEGORIES = [
  { value: "HOUSING", label: "Housing", color: "#8b5cf6", icon: "Home" },
  { value: "UTILITIES", label: "Utilities", color: "#22d3ee", icon: "Zap" },
  { value: "INTERNET", label: "Internet & Phone", color: "#38bdf8", icon: "Wifi" },
  { value: "INSURANCE", label: "Insurance", color: "#a3e635", icon: "ShieldCheck" },
  { value: "SUBSCRIPTIONS", label: "Subscriptions", color: "#f472b6", icon: "CirclePlay" },
  { value: "LOANS", label: "Loans & Cards", color: "#fb923c", icon: "CreditCard" },
  { value: "TRANSPORT", label: "Transport", color: "#2dd4bf", icon: "Car" },
  { value: "HEALTH", label: "Health", color: "#f87171", icon: "HeartPulse" },
  { value: "EDUCATION", label: "Education", color: "#c084fc", icon: "GraduationCap" },
  { value: "OTHER", label: "Other", color: "#94a3b8", icon: "Package" },
] as const;

export const CATEGORY_VALUES = CATEGORIES.map((category) => category.value) as [
  string,
  ...string[],
];

export type CategoryValue = (typeof CATEGORIES)[number]["value"];

export function categoryMeta(value: string) {
  return CATEGORIES.find((category) => category.value === value) ?? CATEGORIES[CATEGORIES.length - 1];
}

export const CURRENCIES = [
  "USD",
  "EUR",
  "GBP",
  "PHP",
  "INR",
  "CAD",
  "AUD",
  "SGD",
  "JPY",
  "AED",
] as const;
