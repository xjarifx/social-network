import * as React from "react";

import { cn } from "../../lib/utils";

const Textarea = React.forwardRef<
  HTMLTextAreaElement,
  React.ComponentProps<"textarea">
>(({ className, ...props }, ref) => {
  return (
    <textarea
      ref={ref}
      className={cn(
        "flex min-h-[120px] w-full rounded-lg border border-[#dadce0] bg-white px-3 py-3 text-[14px] text-[#202124] transition placeholder:text-[#80868b] focus-visible:outline-none focus-visible:border-[#1a73e8] focus-visible:ring-1 focus-visible:ring-[#1a73e8]",
        className,
      )}
      {...props}
    />
  );
});
Textarea.displayName = "Textarea";

export { Textarea };
