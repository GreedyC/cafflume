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
        "rounded-xl border p-5 sm:p-6",
        tone === "default" &&
          "border-[var(--border)] bg-[var(--surface-elevated)]",
        tone === "dark" &&
          "border-transparent bg-[var(--surface-inverse)] text-[var(--inverse-ink)] shadow-[var(--shadow-md)]",
        tone === "muted" &&
          "border-[var(--border)] bg-[color-mix(in_srgb,var(--surface-2)_78%,transparent)]",
        className
      )}
      {...props}
    />
  );
}
