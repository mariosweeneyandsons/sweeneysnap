"use client";

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
          <label className="block text-sm font-medium text-foreground-muted mb-1">
            {label}
          </label>
        )}
        <input
          ref={ref}
          className={`w-full rounded-xs border border-input-border bg-input-bg px-3 py-2 text-input-text placeholder:text-foreground-faint focus:outline-none focus:ring-2 focus:ring-border-strong ${error ? "border-destructive" : ""} ${className}`}
          {...props}
        />
        {error && <p className="mt-1 text-sm text-destructive">{error}</p>}
      </div>
    );
  }
);

Input.displayName = "Input";
