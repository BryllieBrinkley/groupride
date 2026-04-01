import * as React from 'react'

import { cn } from '@/lib/utils'

function Textarea({ className, ...props }: React.ComponentProps<'textarea'>) {
  return (
    <textarea
      data-slot="textarea"
      className={cn(
        'border-input placeholder:text-muted-foreground/85 focus-visible:border-primary/40 focus-visible:ring-primary/15 aria-invalid:ring-destructive/20 aria-invalid:border-destructive flex field-sizing-content min-h-28 w-full rounded-2xl border bg-background px-4 py-3 text-sm text-foreground transition-[color,box-shadow,border-color] outline-none focus-visible:ring-[4px] disabled:cursor-not-allowed disabled:opacity-50',
        className,
      )}
      {...props}
    />
  )
}

export { Textarea }
