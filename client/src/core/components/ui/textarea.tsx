import * as React from "react";

import { cn } from "@/core/lib/utils";

function Textarea({ className, ...props }: React.ComponentProps<"textarea">) {
  return (
    <textarea
      data-slot="textarea"
      className={cn(
        "w-full rounded-sm bg-primary border border-neutral resize-none p-2 focus:bg-muted/80 transition-all duration-400 ease-in-out outline-none focus:shadow-sm focus:ring-2 focus:ring-focus/80 focus:border-accent/40 aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive flex field-sizing-content min-h-20 max-h-40 text-sm shadow-xs disabled:cursor-not-allowed disabled:opacity-50",
        className
      )}
      {...props}
    />
  );
}

export { Textarea };
