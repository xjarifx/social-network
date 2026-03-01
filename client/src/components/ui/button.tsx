import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "../../lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-full text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 cursor-pointer",
  {
    variants: {
      variant: {
        default:
          "bg-[#1a73e8] text-white hover:bg-[#1765cc] active:bg-[#1558b0] shadow-sm hover:shadow",
        secondary: "bg-[#e8f0fe] text-[#1a73e8] hover:bg-[#d2e3fc]",
        outline:
          "border border-[#dadce0] bg-white text-[#3c4043] hover:bg-[#f1f3f4]",
        ghost: "text-[#5f6368] hover:bg-[#f1f3f4] hover:text-[#202124]",
        destructive: "bg-[#ea4335] text-white hover:bg-[#d93025]",
        link: "text-[#1a73e8] underline-offset-4 hover:underline",
      },
      size: {
        default: "h-9 px-6 text-[14px]",
        sm: "h-8 px-4 text-[13px]",
        lg: "h-11 px-8 text-[15px]",
        icon: "h-9 w-9",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

interface ButtonProps
  extends
    React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, ...props }, ref) => {
    return (
      <button
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  },
);
Button.displayName = "Button";

export { Button };
