import React from "react";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: "primary" | "secondary" | "outline" | "ghost" | "danger";
    size?: "sm" | "md" | "lg";
}

export function Button({
                           children,
                           variant = "primary",
                           size = "md",
                           className = "",
                           ...props
                       }: ButtonProps) {
    const base =
        "inline-flex items-center justify-center rounded-full transition-all duration-300 font-medium focus:outline-none focus:ring-2 focus:ring-offset-1 active:scale-95 shadow-sm hover:shadow-md";

    const variants = {
        primary: "bg-primary text-white hover:bg-primary-dark focus:ring-primary-light",
        secondary: "bg-sand-200 text-earth-900 hover:bg-sand-300 focus:ring-sand-300",
        outline: "border border-primary text-primary hover:bg-primary hover:text-white focus:ring-primary",
        ghost: "text-primary-dark hover:bg-sand-100 shadow-none hover:shadow-none",
        danger: "bg-red-50 text-red-600 hover:bg-red-100 border border-red-200",
    };

    const sizes = {
        sm: "px-4 py-1.5 text-xs",
        md: "px-6 py-2.5 text-sm",
        lg: "px-8 py-3.5 text-base",
    };

    return (
        <button className={`${base} ${variants[variant]} ${sizes[size]} ${className}`} {...props}>
            {children}
        </button>
    );
}