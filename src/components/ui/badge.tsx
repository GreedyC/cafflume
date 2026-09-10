import { cn } from "@/lib/utils";

type BadgeProps = React.HTMLAttributes<HTMLSpanElement> & {
  tone?: "default" | "success" | "warning" | "danger";
};

export function Badge({
  className,
  tone = "default",
  children,
  ...props
}: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-lg border border-[var(--border)] bg-[var(--surface-2)] px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.08em] text-[var(--ink)]",
        className
      )}
      {...props}
    >
      <span
        className={cn(
          "h-1.5 w-1.5 rounded-full",
          tone === "default" && "bg-[var(--accent)]",
          tone === "success" && "bg-[var(--moss)]",
          tone === "warning" && "bg-[var(--warning)]",
          tone === "danger" && "bg-[var(--danger)]"
        )}
      />
      {children}
    </span>
  );
}
