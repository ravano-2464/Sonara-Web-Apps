"use client";

import * as React from "react";
import { Eye, EyeOff } from "lucide-react";

import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

interface PasswordInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  showLabel?: string;
  hideLabel?: string;
}

export const PasswordInput = React.forwardRef<HTMLInputElement, PasswordInputProps>(
  function PasswordInput(
    {
      className,
      disabled,
      showLabel = "Show password",
      hideLabel = "Hide password",
      ...props
    },
    ref,
  ) {
    const [visible, setVisible] = React.useState(false);
    const toggleLabel = visible ? hideLabel : showLabel;

    return (
      <div className="relative">
        <Input
          ref={ref}
          {...props}
          disabled={disabled}
          type={visible ? "text" : "password"}
          className={cn("pr-10", className)}
        />
        <button
          type="button"
          aria-label={toggleLabel}
          title={toggleLabel}
          onClick={() => setVisible((value) => !value)}
          disabled={disabled}
          className="absolute right-0 top-0 inline-flex h-10 w-10 items-center justify-center text-zinc-500 transition-colors hover:text-zinc-300 disabled:cursor-not-allowed disabled:text-zinc-600"
        >
          {visible ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
        </button>
      </div>
    );
  },
);
