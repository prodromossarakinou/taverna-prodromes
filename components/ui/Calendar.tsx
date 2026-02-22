"use client";

// Lightweight stub Calendar to avoid depending on react-day-picker (incompatible with React 19).
// When/if a compatible picker is added, this component can be replaced.
import * as React from "react";
import { cn } from "./utils";

type CalendarProps = React.ComponentProps<"div"> & { placeholder?: string };

function Calendar({ className, placeholder = "Ημερολόγιο", ...props }: CalendarProps) {
  return (
    <div
      className={cn(
        "p-3 rounded-md border bg-card text-card-foreground text-sm text-muted-foreground",
        className,
      )}
      {...props}
    >
      {placeholder}
    </div>
  );
}

export { Calendar };
