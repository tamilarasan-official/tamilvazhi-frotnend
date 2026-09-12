import * as React from "react";

export function cn(...parts: (string | false | null | undefined)[]): string {
  return parts.filter(Boolean).join(" ");
}

const buttonBase =
  "inline-flex items-center justify-center gap-2 rounded border font-medium transition-colors";

const buttonVariants = {
  primary:
    "border-brand-600 bg-brand-500 text-white hover:bg-brand-600 disabled:hover:bg-brand-500",
  secondary: "border-ink-600 bg-white text-ink-200 hover:border-ink-500 hover:bg-ink-900",
  ghost: "border-transparent text-ink-400 hover:bg-ink-800 hover:text-ink-100",
  danger: "border-red-800 bg-red-700 text-white hover:bg-red-800",
} as const;

const buttonSizes = {
  sm: "h-9 px-3.5 text-[13px]",
  md: "h-10 px-5 text-sm",
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
        buttonBase,
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

/** Same look as Button, but a real anchor, needed for download links. */
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
      className={cn(buttonBase, buttonVariants[variant], buttonSizes[size], className)}
      {...props}
    />
  );
}

const fieldBase =
  "w-full rounded border border-ink-600 bg-white text-sm text-ink-100 outline-none " +
  "placeholder:text-ink-500 transition-[border-color,box-shadow] " +
  "focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20";

export const Input = React.forwardRef<
  HTMLInputElement,
  React.InputHTMLAttributes<HTMLInputElement>
>(({ className, ...props }, ref) => (
  <input ref={ref} className={cn(fieldBase, "h-10 px-3", className)} {...props} />
));
Input.displayName = "Input";

export const Textarea = React.forwardRef<
  HTMLTextAreaElement,
  React.TextareaHTMLAttributes<HTMLTextAreaElement>
>(({ className, ...props }, ref) => (
  <textarea ref={ref} className={cn(fieldBase, "resize-y px-3 py-2.5", className)} {...props} />
));
Textarea.displayName = "Textarea";

export function Label({
  className,
  ...props
}: React.LabelHTMLAttributes<HTMLLabelElement>) {
  return (
    <label
      className={cn(
        "mb-1.5 block text-[12px] font-semibold uppercase tracking-[0.08em] text-ink-400",
        className,
      )}
      {...props}
    />
  );
}

export function Card({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("panel rounded-md", className)} {...props} />;
}

export function Badge({
  className,
  tone = "neutral",
  ...props
}: React.HTMLAttributes<HTMLSpanElement> & {
  tone?: "neutral" | "brand" | "glow" | "success";
}) {
  const tones = {
    neutral: "border-ink-600 bg-ink-800 text-ink-400",
    brand: "border-brand-500/30 bg-brand-500/8 text-brand-500",
    glow: "border-glow-500/40 bg-glow-500/10 text-glow-400",
    success: "border-emerald-700/30 bg-emerald-50 text-emerald-800",
  };
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-sm border px-2 py-0.5 text-[11px] font-semibold uppercase tracking-[0.06em]",
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
    <div className="flex flex-col items-center justify-center rounded-md border border-dashed border-ink-600 bg-white px-6 py-14 text-center">
      {icon && <div className="mb-3 text-ink-500">{icon}</div>}
      <p className="font-serif text-lg font-semibold text-ink-200">{title}</p>
      {description && (
        <p className="mt-1.5 max-w-sm text-sm leading-relaxed text-ink-400">{description}</p>
      )}
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}
