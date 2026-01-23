import { InputHTMLAttributes, forwardRef } from "react";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, className = "", ...props }, ref) => {
    return (
      <div className="w-full">
        {label && (
          <label className="mb-2 block text-sm font-medium text-sand/80">
            {label}
          </label>
        )}
        <input
          ref={ref}
          className={`w-full rounded-xl border border-sand/20 bg-ink/60 px-4 py-3 text-sand placeholder:text-sand/40 focus:border-sand/40 focus:outline-none focus:ring-2 focus:ring-sand/20 ${className} ${
            error ? "border-red-500/50" : ""
          }`}
          {...props}
        />
        {error && <p className="mt-1 text-sm text-red-400">{error}</p>}
      </div>
    );
  },
);

Input.displayName = "Input";
