import * as React from 'react'
import { Slot } from '@radix-ui/react-slot'
import { cva, type VariantProps } from 'class-variance-authority'

import { cn } from '@/lib/utils'

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-full text-sm font-medium transition-all duration-200 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0 outline-none focus-visible:border-ring focus-visible:ring-ring/40 focus-visible:ring-[3px]",
  {
    variants: {
      variant: {
        default:
          'bg-primary text-primary-foreground shadow-[0_14px_32px_rgba(75,51,39,0.18)] hover:bg-[#3f2b21]',
        destructive:
          'bg-destructive text-white hover:bg-destructive/90 focus-visible:ring-destructive/20',
        outline:
          'border border-border bg-background/90 text-foreground shadow-[0_10px_24px_rgba(75,51,39,0.05)] hover:border-primary/25 hover:bg-card',
        secondary:
          'bg-secondary text-secondary-foreground hover:bg-[#ece4d8]',
        ghost:
          'text-muted-foreground hover:bg-secondary hover:text-foreground',
        link: 'text-primary underline-offset-4 hover:underline',
      },
      size: {
        default: 'h-12 px-6 has-[>svg]:px-5',
        sm: 'h-10 gap-1.5 px-4 has-[>svg]:px-3.5',
        lg: 'h-14 px-8 text-base has-[>svg]:px-6',
        icon: 'size-12',
        'icon-sm': 'size-10',
        'icon-lg': 'size-14',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  },
)

function Button({
  className,
  variant,
  size,
  asChild = false,
  ...props
}: React.ComponentProps<'button'> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean
  }) {
  const Comp = asChild ? Slot : 'button'

  return (
    <Comp
      data-slot="button"
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  )
}

export { Button, buttonVariants }
