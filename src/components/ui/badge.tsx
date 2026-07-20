import { cn } from "@/lib/utils";

type BadgeProps = React.HTMLAttributes<HTMLSpanElement> & {
  tone?: "default" | "success" | "warning" | "danger";
};

export function Badge({
  className,
  tone = "default",
  ...props
}: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-lg px-2.5 py-1 text-[11px] font-bold uppercase tracking-[0.08em]",
        tone === "default" &&
          "bg-[var(--accent-soft)] text-[var(--accent-strong)]",
        tone === "success" && "bg-[var(--moss-soft)] text-[#3d4a35]",
        tone === "warning" &&
          "bg-[var(--warning-soft)] text-[var(--warning)]",
        tone === "danger" && "bg-[var(--danger-soft)] text-[var(--danger)]",
        className
      )}
      {...props}
    />
  );
}
