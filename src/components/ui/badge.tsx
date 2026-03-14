import { mergeProps } from "@base-ui/react/merge-props"
import { useRender } from "@base-ui/react/use-render"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const badgeVariants = cva(
  "group/badge inline-flex h-5 w-fit shrink-0 items-center justify-center gap-1 overflow-hidden rounded-md border border-transparent px-2 py-0.5 text-xs font-medium whitespace-nowrap transition-colors focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 [&>svg]:pointer-events-none [&>svg]:size-3!",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground [a]:hover:bg-primary/80",
        secondary:
          "bg-secondary text-secondary-foreground [a]:hover:bg-secondary/80",
        destructive:
          "bg-destructive/10 text-destructive focus-visible:ring-destructive/20 [a]:hover:bg-destructive/20",
        outline:
          "border-border text-foreground [a]:hover:bg-muted [a]:hover:text-muted-foreground",
        ghost:
          "hover:bg-muted hover:text-muted-foreground",
        link: "text-primary underline-offset-4 hover:underline",
        /* Status variants — use semantic tokens from globals.css */
        status_todo: "bg-[var(--status-todo-bg)] text-[var(--status-todo-text)]",
        status_in_progress: "bg-[var(--status-in-progress-bg)] text-[var(--status-in-progress-text)]",
        status_review: "bg-[var(--status-review-bg)] text-[var(--status-review-text)]",
        status_done: "bg-[var(--status-done-bg)] text-[var(--status-done-text)]",
        /* Priority variants — use semantic tokens from globals.css */
        priority_high: "bg-[var(--priority-high-bg)] text-[var(--priority-high-text)]",
        priority_medium: "bg-[var(--priority-medium-bg)] text-[var(--priority-medium-text)]",
        priority_low: "bg-[var(--priority-low-bg)] text-[var(--priority-low-text)]",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

function Badge({
  className,
  variant = "default",
  render,
  ...props
}: useRender.ComponentProps<"span"> & VariantProps<typeof badgeVariants>) {
  return useRender({
    defaultTagName: "span",
    props: mergeProps<"span">(
      {
        className: cn(badgeVariants({ variant }), className),
      },
      props
    ),
    render,
    state: {
      slot: "badge",
      variant,
    },
  })
}

export { Badge, badgeVariants }
