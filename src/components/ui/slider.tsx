import * as React from "react";

import { cn } from "@/lib/utils";

interface SliderProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
}

export function Slider({ className, label, ...props }: SliderProps) {
  return (
    <label className="flex w-full flex-col gap-1 text-xs text-zinc-400">
      {label ? <span>{label}</span> : null}
      <input
        type="range"
        className={cn(
          "h-2 w-full cursor-pointer appearance-none rounded-full bg-zinc-700 accent-cyan-400",
          className,
        )}
        {...props}
      />
    </label>
  );
}
