import * as React from "react";

import { cn } from "../../lib/utils";

const Input = React.forwardRef<HTMLInputElement, React.ComponentProps<"input">>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          "flex h-10 w-full rounded-md border border-[#dadce0] bg-white px-3 py-2 text-[14px] text-[#202124] transition placeholder:text-[#80868b] focus-visible:outline-none focus-visible:border-[#1a73e8] focus-visible:ring-1 focus-visible:ring-[#1a73e8]",
          className,
        )}
        ref={ref}
        {...props}
      />
    );
  },
);
Input.displayName = "Input";

export { Input };
