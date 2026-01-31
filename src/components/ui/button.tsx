import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap text-sm font-semibold ring-offset-background transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        // Primary CTA - Orange plein, pilule, hover uniforme
        default:
          "bg-primary text-primary-foreground rounded-full shadow-lg shadow-primary/20 hover:shadow-xl hover:shadow-primary/30 hover:opacity-90 hover:-translate-y-0.5 active:translate-y-0",
        // Secondary CTA - Outline pilule, hover sobre
        secondary:
          "bg-transparent border border-border/50 text-foreground rounded-full hover:bg-secondary/50 hover:border-primary/30",
        // Ghost - Navigation/header, même radius que CTA pour cohérence
        ghost: 
          "rounded-full hover:bg-secondary/50 text-muted-foreground hover:text-foreground",
        // Link - Texte simple, même weight que le reste
        link: 
          "text-primary hover:underline underline-offset-4 p-0 h-auto font-semibold",
        // Destructive - Pilule rouge
        destructive:
          "bg-destructive text-destructive-foreground rounded-full shadow-lg shadow-destructive/20 hover:opacity-90",
        // Outline explicite - même que secondary
        outline:
          "border border-border/50 bg-transparent rounded-full hover:bg-secondary/50",
      },
      size: {
        default: "h-11 px-6 text-sm",
        sm: "h-9 px-5 text-[13px]",
        lg: "h-12 px-8 text-sm",
        icon: "h-9 w-9 rounded-full",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
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
    return <Comp className={cn(buttonVariants({ variant, size, className }))} ref={ref} {...props} />;
  }
);
Button.displayName = "Button";

export { Button, buttonVariants };