import * as React from 'react'

import { cn } from '@/lib/utils'

function Input({ className, type, ...props }: React.ComponentProps<'input'>) {
  return (
    <input
      type={type}
      data-slot="input"
      autoComplete='off'
      className={cn(
        "text-right font-semibold text-xl placeholder:text-muted-foreground border-0 focus-visible:ring-0 focus-visible:ring-offset-0 outline-none"
      )}
      {...props}
    />
  )
}

export { Input }
