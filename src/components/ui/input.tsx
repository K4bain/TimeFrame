"use client";

import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

/**
 * Input — transparent text field.
 *
 * Borderless by design; relies on its container to provide the
 * hairline frame. Focus state surfaces a gold underline.
 */

const inputVariants = cva(
  "w-full bg-transparent outline-none text-paper placeholder:text-paper-dim font-mono tabular-nums transition-colors",
  {
    variants: {
      size: {
        sm: "text-sm",
        md: "text-base",
      },
    },
    defaultVariants: {
      size: "md",
    },
  }
);

export interface InputProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "size">,
    VariantProps<typeof inputVariants> {}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, size, type = "text", ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(inputVariants({ size, className }))}
        ref={ref}
        {...props}
      />
    );
  }
);
Input.displayName = "Input";

export { Input, inputVariants };
