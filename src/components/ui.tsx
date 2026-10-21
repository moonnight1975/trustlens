import type {
  ButtonHTMLAttributes,
  HTMLAttributes,
  InputHTMLAttributes,
  ReactNode,
  TextareaHTMLAttributes,
} from "react";

import { cn } from "@/lib/cn";

/* ─── Button ─────────────────────────────────────────── */
export function Button({
  variant = "primary",
  className,
  type = "button",
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "ghost" | "danger" | "secondary";
}) {
  return (
    <button
      type={type}
      className={cn(
        // base
        "inline-flex min-h-11 items-center justify-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold select-none",
        "transition-all duration-150",
        "disabled:cursor-not-allowed disabled:opacity-50",
        "focus-visible:outline-2 focus-visible:outline-primary focus-visible:outline-offset-2",
        // variants
        variant === "primary" &&
          "gradient-primary text-white shadow-nm-raised-sm hover:shadow-glow active:shadow-nm-inset",
        variant === "secondary" &&
          "nm-raised-sm text-primary border border-border-light hover:border-primary/30 active:shadow-nm-inset",
        variant === "ghost" &&
          "nm-raised-sm text-fg border border-border-light hover:border-primary/30 active:shadow-nm-inset",
        variant === "danger" && "nm-raised-sm border border-border-light bg-bad-bg text-bad",
        className,
      )}
      {...props}
    />
  );
}

/* ─── Card ─────────────────────────────────────────────── */
export function Card({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "rounded-card bg-surface nm-raised border border-border-light",
        className,
      )}
      {...props}
    />
  );
}

/* ─── InsetCard ─────────────────────────────────────────── */
export function InsetCard({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn("nm-inset rounded-2xl", className)} {...props} />
  );
}

/* ─── Field ─────────────────────────────────────────────── */
export function Field({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: ReactNode;
}) {
  return (
    <label className="block">
      <span className="mb-1 block text-sm font-semibold text-fg">{label}</span>
      {hint ? <span className="mb-2 block text-sm text-muted leading-snug">{hint}</span> : null}
      {children}
    </label>
  );
}

/* ─── TextArea ───────────────────────────────────────────── */
export function TextArea({
  className,
  ...props
}: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      {...props}
      className={cn(
        "min-h-32 w-full resize-y px-4 py-3 text-base text-fg leading-relaxed",
        "nm-inset border border-border-light rounded-2xl",
        "placeholder:text-subtle",
        "focus:outline-none focus-visible:outline-2 focus-visible:outline-primary focus-visible:outline-offset-1",
        "transition-all duration-150",
        className,
      )}
    />
  );
}

/* ─── Input ──────────────────────────────────────────────── */
export function Input({
  className,
  ...props
}: InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      {...props}
      className={cn(
        "min-h-11 w-full px-4 py-2 text-base text-fg",
        "nm-inset border border-border-light rounded-xl",
        "placeholder:text-subtle",
        "focus:outline-none focus-visible:outline-2 focus-visible:outline-primary focus-visible:outline-offset-1",
        className,
      )}
    />
  );
}

/* ─── Notice ─────────────────────────────────────────────── */
export function Notice({
  tone = "info",
  children,
}: {
  tone?: "info" | "warn" | "bad";
  children: ReactNode;
}) {
  return (
    <p
      className={cn(
        "rounded-xl border px-4 py-3 text-sm",
        tone === "info" && "bg-info-bg text-info border-blue-200",
        tone === "warn" && "bg-warn-bg text-warn border-yellow-200",
        tone === "bad" && "bg-bad-bg text-bad border-red-200",
      )}
    >
      {children}
    </p>
  );
}

/* ─── Badge / Pill ───────────────────────────────────────── */
export function Badge({
  children,
  variant = "default",
  className,
}: {
  children: ReactNode;
  variant?: "default" | "primary" | "ok" | "warn" | "bad";
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold",
        variant === "default" && "bg-accent text-primary",
        variant === "primary" && "gradient-primary text-white",
        variant === "ok" && "bg-ok-bg text-ok",
        variant === "warn" && "bg-warn-bg text-warn",
        variant === "bad" && "bg-bad-bg text-bad",
        className,
      )}
    >
      {children}
    </span>
  );
}

/* ─── FeatureChip ────────────────────────────────────────── */
export function FeatureChip({
  icon,
  label,
}: {
  icon: ReactNode;
  label: string;
}) {
  return (
    <div className="nm-raised-sm flex items-center gap-2 rounded-full px-3 py-1.5 border border-border-light">
      <span className="text-primary flex-shrink-0">{icon}</span>
      <span className="text-xs font-semibold text-fg whitespace-nowrap">{label}</span>
    </div>
  );
}

/* ─── StepIndicator ──────────────────────────────────────── */
export function StepIndicator({ number, label }: { number: number; label: string }) {
  return (
    <div className="flex items-center gap-3 mb-3">
      <div className="gradient-primary size-7 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0 shadow-sm">
        {number}
      </div>
      <span className="font-semibold text-fg">{label}</span>
    </div>
  );
}
