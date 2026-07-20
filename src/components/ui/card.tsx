import { cn } from "@/lib/utils";

type CardProps = React.HTMLAttributes<HTMLDivElement> & {
  tone?: "default" | "dark" | "muted";
};

export function Card({
  className,
  tone = "default",
  ...props
}: CardProps) {
  return (
    <div
      className={cn(
        "rounded-2xl border p-5 shadow-[var(--shadow-sm)] sm:p-6",
        tone === "default" &&
          "border-[var(--border)] bg-[rgba(255,253,248,0.94)]",
        tone === "dark" &&
          "border-transparent bg-[var(--surface-inverse)] text-white shadow-[var(--shadow-md)]",
        tone === "muted" &&
          "border-[var(--border)] bg-[rgba(235,227,215,0.72)]",
        className
      )}
      {...props}
    />
  );
}
