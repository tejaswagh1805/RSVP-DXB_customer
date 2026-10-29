import type { ReactNode } from "react";
import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { cn } from "@/lib/utils";

export function Button({
  children,
  variant = "primary",
  size = "md",
  className,
  type = "button",
  onClick,
  disabled,
}: {
  children: ReactNode;
  variant?: "primary" | "outline" | "ghost" | "danger" | "success";
  size?: "sm" | "md" | "lg";
  className?: string;
  type?: "button" | "submit";
  onClick?: () => void;
  disabled?: boolean;
}) {
  const variants: Record<string, string> = {
    primary: "bg-primary text-primary-foreground hover:bg-primary/90",
    outline: "border border-border bg-transparent text-foreground hover:bg-surface-2",
    ghost: "bg-transparent text-muted-foreground hover:text-foreground",
    danger: "bg-destructive text-destructive-foreground hover:bg-destructive/90",
    success: "bg-success text-success-foreground hover:bg-success/90",
  };
  const sizes: Record<string, string> = {
    sm: "h-8 px-3 text-xs",
    md: "h-10 px-5 text-sm",
    lg: "h-12 px-7 text-sm",
  };
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={cn(
        "inline-flex items-center justify-center gap-2 rounded-md font-medium tracking-wide transition-colors disabled:opacity-40",
        variants[variant],
        sizes[size],
        className,
      )}
    >
      {children}
    </button>
  );
}

export function Badge({
  children,
  tone = "muted",
  className,
}: {
  children: ReactNode;
  tone?: "muted" | "gold" | "green" | "amber" | "red";
  className?: string;
}) {
  const tones: Record<string, string> = {
    muted: "bg-surface-2 text-muted-foreground",
    gold: "bg-primary/15 text-primary",
    green: "bg-success/15 text-success",
    amber: "bg-warning/15 text-warning",
    red: "bg-destructive/15 text-destructive",
  };
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-[11px] font-medium tracking-wide",
        tones[tone],
        className,
      )}
    >
      {children}
    </span>
  );
}

export function Card({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div className={cn("rounded-xl border border-border bg-card p-5", className)}>{children}</div>
  );
}

export function Section({
  eyebrow,
  title,
  intro,
  children,
  className,
}: {
  eyebrow?: string;
  title?: string;
  intro?: string;
  children?: ReactNode;
  className?: string;
}) {
  return (
    <section className={cn("customer-section mx-auto w-full max-w-6xl px-5 py-16", className)}>
      {eyebrow ? <p className="eyebrow">{eyebrow}</p> : null}
      {title ? <h2 className="mt-3 text-3xl md:text-4xl">{title}</h2> : null}
      {intro ? <p className="mt-3 max-w-2xl text-sm text-muted-foreground">{intro}</p> : null}
      {children}
    </section>
  );
}

export function Stat({ label, value, hint }: { label: string; value: string; hint?: string }) {
  return (
    <Card className="p-4">
      <p className="eyebrow">{label}</p>
      <p className="mt-2 font-display text-3xl text-foreground">{value}</p>
      {hint ? <p className="mt-1 text-xs text-muted-foreground">{hint}</p> : null}
    </Card>
  );
}

export function Field({
  label,
  icon,
  children,
}: {
  label: string;
  icon?: ReactNode;
  children: ReactNode;
}) {
  return (
    <label className="block">
      <span className="eyebrow inline-flex items-center gap-2">
        {icon ? <span className="field-icon" aria-hidden="true">{icon}</span> : null}
        {label}
      </span>
      <div className="mt-2">{children}</div>
    </label>
  );
}

export const inputClass =
  "w-full rounded-md border border-input bg-surface px-3 py-2.5 text-sm text-foreground outline-none placeholder:text-muted-foreground focus:border-primary";

export function PasswordInput({
  className,
  defaultValue,
  value,
  onChange,
  placeholder,
  autoComplete = "current-password",
  id,
}: {
  className?: string;
  defaultValue?: string;
  value?: string;
  onChange?: (value: string) => void;
  placeholder?: string;
  autoComplete?: string;
  id?: string;
}) {
  const [show, setShow] = useState(false);
  return (
    <div className="relative">
      <input
        id={id}
        className={cn(inputClass, "pr-11", className)}
        type={show ? "text" : "password"}
        defaultValue={defaultValue}
        value={value}
        onChange={(e) => onChange?.(e.target.value)}
        placeholder={placeholder}
        autoComplete={autoComplete}
      />
      <button
        type="button"
        aria-label={show ? "Hide password" : "Show password"}
        aria-pressed={show}
        title={show ? "Hide password" : "Show password"}
        onClick={() => setShow((s) => !s)}
        className="absolute right-0 top-0 flex h-full w-11 items-center justify-center text-muted-foreground transition-colors hover:text-foreground"
      >
        {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
      </button>
    </div>
  );
}
