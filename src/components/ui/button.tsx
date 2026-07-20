import { forwardRef } from "react";
import { cn } from "@/lib/utils";

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary" | "ghost" | "danger";
  size?: "sm" | "md";
};

export const buttonStyles = ({
  variant = "primary",
  size = "md",
  className
}: {
  variant?: ButtonProps["variant"];
  size?: ButtonProps["size"];
  className?: string;
} = {}) =>
  cn(
    "inline-flex items-center justify-center gap-2 rounded-xl font-bold outline-none transition disabled:cursor-not-allowed disabled:opacity-50 focus-visible:ring-2 focus-visible:ring-[var(--ring)] focus-visible:ring-offset-2",
    size === "md" ? "min-h-11 px-4 py-2.5 text-sm" : "min-h-10 px-3 py-2 text-xs",
    variant === "primary" &&
      "bg-[var(--accent)] text-white shadow-[var(--shadow-sm)] hover:bg-[var(--accent-strong)]",
    variant === "secondary" &&
      "border border-[var(--border)] bg-[var(--surface)] text-[var(--ink)] hover:border-[var(--border-strong)] hover:bg-[var(--surface-2)]",
    variant === "ghost" &&
      "bg-transparent text-[var(--ink-muted)] hover:bg-[var(--surface-2)] hover:text-[var(--ink)]",
    variant === "danger" &&
      "bg-[var(--danger)] text-white hover:bg-[#7d2828]",
    className
  );

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  function Button(
    { className, variant = "primary", size = "md", ...props },
    ref
  ) {
    return (
      <button
        ref={ref}
        className={buttonStyles({ variant, size, className })}
        {...props}
      />
    );
  }
);
