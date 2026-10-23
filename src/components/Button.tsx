import Link from "next/link";
import type { ComponentProps, ReactNode } from "react";

type Variant = "primary" | "secondary" | "ghost";

const base =
  "inline-flex items-center justify-center gap-2 rounded-full text-sm font-medium tracking-wide transition duration-300 disabled:opacity-40 disabled:pointer-events-none select-none";

const variants: Record<Variant, string> = {
  primary:
    "bg-paper text-ink px-6 py-3 hover:bg-white hover:shadow-[0_0_40px_-6px_var(--glow)]",
  secondary:
    "border border-line bg-white/[0.03] text-paper px-5 py-2.5 hover:bg-white/[0.08] hover:border-paper/30 backdrop-blur",
  ghost: "text-muted px-3 py-2 hover:text-paper",
};

export function buttonClass(variant: Variant = "primary", extra = "") {
  return `${base} ${variants[variant]} ${extra}`;
}

export function Button({
  variant = "primary",
  className = "",
  type = "button",
  ...props
}: ComponentProps<"button"> & { variant?: Variant }) {
  return (
    <button type={type} className={buttonClass(variant, className)} {...props} />
  );
}

export function ButtonLink({
  href,
  variant = "primary",
  className = "",
  children,
}: {
  href: string;
  variant?: Variant;
  className?: string;
  children: ReactNode;
}) {
  return (
    <Link href={href} className={buttonClass(variant, className)}>
      {children}
    </Link>
  );
}
