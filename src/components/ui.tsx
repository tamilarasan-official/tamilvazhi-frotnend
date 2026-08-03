import * as React from "react";

export function cn(...parts: (string | false | null | undefined)[]): string {
  return parts.filter(Boolean).join(" ");
}

const buttonVariants = {
  primary:
    "bg-brand-500 text-white hover:bg-brand-400 shadow-lg shadow-brand-500/25 disabled:hover:bg-brand-500",
  secondary:
    "bg-ink-800 text-ink-100 border border-ink-600/70 hover:border-ink-500 hover:bg-ink-700",
  ghost: "text-ink-300 hover:text-ink-100 hover:bg-ink-800/70",
  danger: "bg-red-500/90 text-white hover:bg-red-500",
} as const;

const buttonSizes = {
  sm: "h-9 px-3.5 text-[13px]",
  md: "h-11 px-5 text-sm",
  lg: "h-12 px-6 text-[15px]",
} as const;

export type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: keyof typeof buttonVariants;
  size?: keyof typeof buttonSizes;
};

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "primary", size = "md", ...props }, ref) => (
    <button
      ref={ref}
      className={cn(
        "inline-flex items-center justify-center gap-2 rounded-xl font-medium transition-all",
        "disabled:cursor-not-allowed disabled:opacity-50",
        buttonVariants[variant],
        buttonSizes[size],
        className,
      )}
      {...props}
    />
  ),
);
Button.displayName = "Button";

/** Same look as Button, but a real anchor — needed for download links. */
export function LinkButton({
  className,
  variant = "primary",
  size = "md",
  ...props
}: React.AnchorHTMLAttributes<HTMLAnchorElement> & {
  variant?: keyof typeof buttonVariants;
  size?: keyof typeof buttonSizes;
}) {
  return (
    <a
      className={cn(
        "inline-flex items-center justify-center gap-2 rounded-xl font-medium transition-all",
        buttonVariants[variant],
        buttonSizes[size],
        className,
      )}
      {...props}
    />
  );
}

export const Input = React.forwardRef<
  HTMLInputElement,
  React.InputHTMLAttributes<HTMLInputElement>
>(({ className, ...props }, ref) => (
  <input
    ref={ref}
    className={cn(
      "h-11 w-full rounded-xl border border-ink-600/70 bg-ink-900/70 px-3.5 text-sm text-ink-100",
      "placeholder:text-ink-500 transition-colors",
      "focus:border-brand-500/70 focus:bg-ink-900",
      className,
    )}
    {...props}
  />
));
Input.displayName = "Input";

export const Textarea = React.forwardRef<
  HTMLTextAreaElement,
  React.TextareaHTMLAttributes<HTMLTextAreaElement>
>(({ className, ...props }, ref) => (
  <textarea
    ref={ref}
    className={cn(
      "w-full resize-y rounded-xl border border-ink-600/70 bg-ink-900/70 px-3.5 py-2.5 text-sm text-ink-100",
      "placeholder:text-ink-500 transition-colors focus:border-brand-500/70 focus:bg-ink-900",
      className,
    )}
    {...props}
  />
));
Textarea.displayName = "Textarea";

export function Label({
  className,
  ...props
}: React.LabelHTMLAttributes<HTMLLabelElement>) {
  return (
    <label
      className={cn("mb-1.5 block text-[13px] font-medium text-ink-300", className)}
      {...props}
    />
  );
}

export function Card({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("panel rounded-2xl", className)} {...props} />;
}

export function Badge({
  className,
  tone = "neutral",
  ...props
}: React.HTMLAttributes<HTMLSpanElement> & {
  tone?: "neutral" | "brand" | "glow" | "success";
}) {
  const tones = {
    neutral: "bg-ink-700/60 text-ink-300 border-ink-600/60",
    brand: "bg-brand-500/15 text-brand-400 border-brand-500/30",
    glow: "bg-glow-500/15 text-glow-400 border-glow-500/30",
    success: "bg-emerald-500/15 text-emerald-400 border-emerald-500/30",
  };
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-[11px] font-medium tracking-wide",
        tones[tone],
        className,
      )}
      {...props}
    />
  );
}

export function EmptyState({
  icon,
  title,
  description,
  action,
}: {
  icon?: React.ReactNode;
  title: string;
  description?: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-ink-600/60 px-6 py-14 text-center">
      {icon && <div className="mb-3 text-ink-500">{icon}</div>}
      <p className="text-[15px] font-medium text-ink-200">{title}</p>
      {description && (
        <p className="mt-1.5 max-w-sm text-sm leading-relaxed text-ink-400">{description}</p>
      )}
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}
