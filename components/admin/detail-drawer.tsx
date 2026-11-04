"use client"

import { createContext, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from "react"
import { ChevronLeft, ChevronRight, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Sheet, SheetClose, SheetContent, SheetDescription, SheetFooter, SheetTitle } from "@/components/ui/sheet"

const UnsavedChangesContext = createContext<{ setDirty: (dirty: boolean) => void }>({ setDirty: () => {} })

/**
 * Call from drawer content that holds unsaved input. While `dirty` is true, closing the drawer
 * or stepping to another item asks for confirmation instead of silently discarding the input.
 */
export function useUnsavedChanges(dirty: boolean) {
  const { setDirty } = useContext(UnsavedChangesContext)
  useEffect(() => {
    setDirty(dirty)
    return () => setDirty(false)
  }, [dirty, setDirty])
}

export type DetailDrawerProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  title: ReactNode
  description?: ReactNode
  /** Status or other short label shown beside the title. */
  badge?: ReactNode
  children: ReactNode
  /** Pinned below the scrolling content, e.g. for primary actions. */
  footer?: ReactNode
  /** Lets reviewers step through a list without closing the drawer. `position` is 1-based. */
  navigation?: { position: number; total: number; onPrevious?: () => void; onNext?: () => void }
  /** Changing this scrolls the content back to the top. Pass the id of the item being shown. */
  contentKey?: string
  onCloseAutoFocus?: (event: Event) => void
}

export function DetailDrawer({ open, onOpenChange, title, description, badge, children, footer, navigation, contentKey, onCloseAutoFocus }: DetailDrawerProps) {
  const body = useRef<HTMLDivElement>(null)
  const [dirty, setDirty] = useState(false)
  const guard = useMemo(() => ({ setDirty }), [])
  useEffect(() => { body.current?.scrollTo({ top: 0 }) }, [contentKey])

  // Closing the drawer or stepping to another item discards any input, so ask first.
  const canLeave = () => !dirty || window.confirm("You have unsaved changes. Discard them?")
  const leaveThen = (action?: () => void) => action && (() => { if (canLeave()) action() })

  return (
    <UnsavedChangesContext.Provider value={guard}>
      <Sheet open={open} onOpenChange={(next) => { if (next || canLeave()) onOpenChange(next) }}>
        <SheetContent
          showCloseButton={false}
          className="sm:max-w-xl lg:max-w-2xl"
          onCloseAutoFocus={onCloseAutoFocus}
          {...(description ? {} : { "aria-describedby": undefined })}
        >
          <div className="flex items-center justify-between gap-2 px-4 pt-3">
            <div className="flex items-center gap-1">
              {navigation && (
                <>
                  <Button type="button" variant="ghost" size="icon-sm" aria-label="Previous item"
                    disabled={!navigation.onPrevious} onClick={leaveThen(navigation.onPrevious)}>
                    <ChevronLeft />
                  </Button>
                  <Button type="button" variant="ghost" size="icon-sm" aria-label="Next item"
                    disabled={!navigation.onNext} onClick={leaveThen(navigation.onNext)}>
                    <ChevronRight />
                  </Button>
                  <span className="ml-1 text-xs text-muted-foreground tabular-nums" aria-live="polite">
                    {navigation.position} of {navigation.total}
                  </span>
                </>
              )}
            </div>
            <SheetClose asChild>
              <Button type="button" variant="ghost" size="icon-sm" aria-label="Close details"><X /></Button>
            </SheetClose>
          </div>
          <div className="space-y-1.5 border-b border-border px-6 pt-3 pb-5">
            <div className="flex items-start justify-between gap-3">
              <SheetTitle className="text-xl leading-snug break-words">{title}</SheetTitle>
              {badge && <div className="shrink-0 pt-0.5">{badge}</div>}
            </div>
            {description && (
              <SheetDescription asChild>
                <div className="text-sm break-words">{description}</div>
              </SheetDescription>
            )}
          </div>
          <div ref={body} className="flex-1 space-y-8 overflow-y-auto px-6 py-6">{children}</div>
          {footer && <SheetFooter className="border-t border-border px-6 py-4">{footer}</SheetFooter>}
        </SheetContent>
      </Sheet>
    </UnsavedChangesContext.Provider>
  )
}
