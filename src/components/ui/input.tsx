"use client";

import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

/**
 * Input primitive — COMP.1.
 *
 * Single styled text input used across the chrome (header search, hero
 * search). Replaces the three bespoke inline <input> blocks that had begun
 * to drift apart in padding, focus treatment, and placeholder color.
 *
 * Spec reference: COMP.1, MOT.2 (focus transition = --dur-fast).
 */

const inputVariants = cva(
  "w-full bg-transparent outline-none text-text-primary placeholder:text-text-muted transition-colors",
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
