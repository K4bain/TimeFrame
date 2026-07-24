"use client";

import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg text-sm font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-gold focus-visible:ring-offset-2 focus-visible:ring-offset-ink-void disabled:pointer-events-none disabled:opacity-40 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default:
          "bg-gold text-ink-void font-medium hover:bg-gold-bright active:bg-gold-deep shadow-sm hover:shadow-md hover:shadow-glow-amber",
        destructive:
          "bg-error text-paper hover:brightness-110 shadow-sm",
        outline:
          "border border-rule text-paper hover:border-gold hover:text-gold hover:bg-gold/5",
        secondary:
          "bg-ink-panel border border-rule text-paper-soft hover:text-paper hover:border-rule-bright hover:bg-ink-raised",
        ghost:
          "text-paper-faint hover:text-paper hover:bg-ink-raised/50",
        link:
          "text-gold underline-offset-4 hover:underline hover:text-gold-bright",
      },
      size: {
        default: "h-10 px-5 py-2",
        sm: "h-9 px-3.5",
        lg: "h-12 px-8 text-base",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: { variant: "default", size: "default" },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";

export { Button, buttonVariants };
