import { ButtonHTMLAttributes, forwardRef } from "react";
import { cn } from "@/lib/utils";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "default" | "outline" | "ghost";
  size?: "sm" | "md" | "lg";
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "default", size = "md", ...props }, ref) => {
    return (
      <button
        className={cn(
          "rounded-md font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2",
          size === "sm" && "px-2 py-1 text-sm",
          size === "md" && "px-4 py-2",
          size === "lg" && "px-6 py-3 text-lg",
          variant === "default" &&
            "bg-blue-600 text-white hover:bg-blue-700",
          variant === "outline" &&
            "border border-gray-300 bg-white hover:bg-gray-50",
          variant === "ghost" && "hover:bg-gray-100",
          className
        )}
        ref={ref}
        {...props}
      />
    );
  }
);

Button.displayName = "Button";

