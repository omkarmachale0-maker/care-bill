interface CurrencyProps {
  amount: number;
  className?: string;
  showSign?: boolean;
  size?: "sm" | "md" | "lg" | "xl";
}

export function Currency({ amount, className = "", showSign, size = "md" }: CurrencyProps) {
  const formatted = new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 2,
  }).format(Math.abs(amount));

  const sizeClass = {
    sm: "text-sm",
    md: "text-base",
    lg: "text-lg font-semibold",
    xl: "text-2xl font-bold",
  }[size];

  const sign = showSign && amount < 0 ? "– " : showSign && amount > 0 ? "+ " : "";

  return (
    <span className={`tabular-nums font-semibold ${sizeClass} ${className}`}>
      {sign}
      {formatted}
    </span>
  );
}
