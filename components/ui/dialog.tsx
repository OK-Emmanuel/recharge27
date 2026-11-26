"use client"

import * as React from "react"
import * as DialogPrimitive from "@radix-ui/react-dialog"
import { Cancel01Icon } from "@hugeicons/core-free-icons"
import { Icon } from "@/components/icon"
import { cn } from "@/lib/utils"

const Dialog = DialogPrimitive.Root

function DialogContent({ className, children, ...props }: React.ComponentProps<typeof DialogPrimitive.Content>) {
  return (
    <DialogPrimitive.Portal>
      <DialogPrimitive.Overlay className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm data-[state=closed]:animate-overlay-out data-[state=open]:animate-overlay-in" />
      <DialogPrimitive.Content
        className={cn(
          "fixed top-1/2 left-1/2 z-50 max-h-[92dvh] w-[calc(100%-1.5rem)] -translate-x-1/2 -translate-y-1/2 overflow-y-auto rounded-xl border border-line bg-card p-6 text-card-foreground shadow-2xl outline-none sm:max-w-lg sm:p-8 data-[state=closed]:animate-overlay-out data-[state=open]:animate-overlay-in",
          className,
        )}
        {...props}
      >
        {children}
        <DialogPrimitive.Close className="absolute top-4 right-4 inline-flex size-9 cursor-pointer items-center justify-center rounded-full text-mist transition-colors hover:text-accent-bright">
          <Icon icon={Cancel01Icon} size={18} />
          <span className="sr-only">Close</span>
        </DialogPrimitive.Close>
      </DialogPrimitive.Content>
    </DialogPrimitive.Portal>
  )
}

function DialogTitle({ className, ...props }: React.ComponentProps<typeof DialogPrimitive.Title>) {
  return <DialogPrimitive.Title className={cn("font-serif text-3xl font-light text-ivory", className)} {...props} />
}

function DialogDescription({ className, ...props }: React.ComponentProps<typeof DialogPrimitive.Description>) {
  return <DialogPrimitive.Description className={cn("mt-2 text-sm leading-relaxed text-mist", className)} {...props} />
}

export { Dialog, DialogContent, DialogDescription, DialogTitle }
