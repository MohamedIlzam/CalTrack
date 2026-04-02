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
  const baseStyles = "inline-flex items-center justify-center font-semibold transition-colors duration-200 outline-none";
  
  // Noticeably pill-shaped in the designs
  const roundedStyles = "rounded-full";

  const variants = {
    primary: "bg-primary text-white hover:bg-opacity-90 active:bg-secondary",
    secondary: "bg-primary-light text-secondary hover:bg-opacity-80",
    ghost: "bg-transparent text-muted hover:text-foreground",
    outline: "bg-transparent border border-gray-300 text-foreground hover:bg-gray-50",
  };

  const sizes = {
    small: "px-4 py-2 text-sm",
    default: "px-6 py-3 text-base",
    large: "px-8 py-4 text-lg",
  };

  const classes = [
    baseStyles,
    roundedStyles,
    variants[variant],
    sizes[size],
    fullWidth ? "w-full" : "",
    className,
  ].join(" ");

  return (
    <button className={classes} {...props}>
      {leftIcon && <span className="mr-2">{leftIcon}</span>}
      {children}
      {rightIcon && <span className="ml-2">{rightIcon}</span>}
    </button>
  );
}
