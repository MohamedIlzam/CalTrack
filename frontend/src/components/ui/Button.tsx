import React from "react";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "ghost" | "outline";
  size?: "default" | "large" | "small";
  fullWidth?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export function Button({
  children,
  variant = "primary",
  size = "default",
  fullWidth = false,
  leftIcon,
  rightIcon,
  className = "",
  ...props
}: ButtonProps) {
  const baseStyles =
    "inline-flex items-center justify-center font-bold transition-all duration-200 outline-none";

  const variants: Record<string, string> = {
    primary:
      "text-white shadow-[0_12px_24px_rgba(0,107,95,0.15)]",
    secondary:
      "bg-primary-light text-secondary hover:bg-opacity-80 rounded-full",
    ghost:
      "bg-transparent text-muted hover:text-foreground rounded-full",
    outline:
      "bg-transparent border border-gray-300 text-foreground hover:bg-gray-50 rounded-full",
  };

  const sizes: Record<string, string> = {
    small: "px-4 py-2 text-sm h-10 rounded-xl",
    default: "px-6 py-3 text-base h-12 rounded-xl",
    large: "px-8 py-[14px] text-lg h-14 rounded-xl",
  };

  // Primary uses a gradient background from the Figma spec
  const inlineStyle: React.CSSProperties =
    variant === "primary"
      ? { background: "linear-gradient(101.78deg, #006B5F 0%, #2DD4BF 100%)" }
      : {};

  const classes = [
    baseStyles,
    variants[variant],
    sizes[size],
    fullWidth ? "w-full" : "",
    className,
  ].join(" ");

  return (
    <button className={classes} style={inlineStyle} {...props}>
      {leftIcon && <span className="mr-2">{leftIcon}</span>}
      {children}
      {rightIcon && <span className="ml-2">{rightIcon}</span>}
    </button>
  );
}
