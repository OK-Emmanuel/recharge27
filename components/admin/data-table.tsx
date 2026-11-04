"use client"

import { useEffect, useMemo, useRef, useState, type ReactNode } from "react"
import { ArrowDown, ArrowUp, ArrowUpDown, ChevronRight, Search } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { filterByQuery, pageForIndex, paginate, sortRows, type SortDirection, type SortValue } from "@/lib/admin-table"
import { plural } from "@/lib/format"
import { cn } from "@/lib/utils"
import { DetailDrawer } from "./detail-drawer"
import { pillClass } from "./pill-class"

export type DataTableColumn<T> = {
  id: string
  header: string
  /** The first column also opens the drawer, so keep its content inline (spans rather than divs). */
  cell: (row: T) => ReactNode
  /** Makes the column sortable. */
  sortValue?: (row: T) => SortValue
  /** Applied to the header and every cell, e.g. "hidden md:table-cell" for secondary columns. */
  className?: string
}

export type DataTableFilter<T> = {
  /** Accessible name for the group of filter buttons. */
  label: string
  options: readonly { value: string; label: string }[]
  /** Which option a row belongs to. An "All" button is added automatically. */
  getValue: (row: T) => string
}

export type DataTableDetail<T> = {
  title: (row: T) => ReactNode
  description?: (row: T) => ReactNode
  badge?: (row: T) => ReactNode
  content: (row: T) => ReactNode
  footer?: (row: T) => ReactNode
}

export type DataTableProps<T> = {
  /** Describes the table for screen readers. */
  caption: string
  rows: readonly T[]
  columns: readonly DataTableColumn<T>[]
  getRowId: (row: T) => string
  /** Text the search box matches against. Omit to hide search. Define it outside the component so it stays stable. */
  searchText?: (row: T) => string
  searchPlaceholder?: string
  /** Accessible name for the search box. Defaults to the placeholder. */
  searchLabel?: string
  filter?: DataTableFilter<T>
  initialSort?: { columnId: string; direction: SortDirection }
  /** Rows per page in the browser. Omit for data that is already paginated by the server. */
  pageSize?: number
  emptyMessage?: ReactNode
  /** When provided, rows open a drawer on the right with the full details. */
  detail?: DataTableDetail<T>
}

export function DataTable<T>({
  caption, rows, columns, getRowId, searchText, searchPlaceholder = "Search…", searchLabel, filter,
  initialSort, pageSize, emptyMessage = "Nothing to show yet.", detail,
}: DataTableProps<T>) {
  const [query, setQuery] = useState("")
  const [filterValue, setFilterValue] = useState("all")
  const [sort, setSort] = useState<{ columnId: string; direction: SortDirection } | null>(initialSort ?? null)
  const [page, setPage] = useState(0)
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [open, setOpen] = useState(false)
  const triggers = useRef(new Map<string, HTMLElement>())

  const filterCounts = useMemo(() => {
    const counts = new Map<string, number>()
    if (filter) for (const row of rows) counts.set(filter.getValue(row), (counts.get(filter.getValue(row)) ?? 0) + 1)
    return counts
  }, [rows, filter])

  const sorted = useMemo(() => {
    const inFilter = filter && filterValue !== "all" ? rows.filter((row) => filter.getValue(row) === filterValue) : rows
    const matched = searchText ? filterByQuery(inFilter, query, searchText) : [...inFilter]
    const column = sort ? columns.find((item) => item.id === sort.columnId) : undefined
    return sort && column?.sortValue ? sortRows(matched, column.sortValue, sort.direction) : matched
  }, [rows, filter, filterValue, searchText, query, sort, columns])

  const view = paginate(sorted, page, pageSize)
  const selectedRow = selectedId === null ? undefined : rows.find((row) => getRowId(row) === selectedId)
  const selectedIndex = selectedRow === undefined ? -1 : sorted.indexOf(selectedRow)

  // If the open item disappears (for example after a save changes which filter it matches), close the drawer.
  useEffect(() => {
    if (open && selectedRow === undefined) setOpen(false)
  }, [open, selectedRow])

  function openRow(id: string) {
    setSelectedId(id)
    setOpen(true)
  }

  function step(offset: number) {
    const next = sorted[selectedIndex + offset]
    if (!next) return
    setSelectedId(getRowId(next))
    setPage(pageForIndex(selectedIndex + offset, pageSize))
  }

  function toggleSort(columnId: string) {
    setPage(0)
    setSort((current) => {
      if (current?.columnId !== columnId) return { columnId, direction: "asc" }
      return current.direction === "asc" ? { columnId, direction: "desc" } : null
    })
  }

  const total = sorted.length
  const summary = view.pageCount > 1
    ? `Showing ${view.start + 1}–${view.start + view.rows.length} of ${total}`
    : plural(total, "result")

  return (
    <div className="space-y-4">
      {rows.length > 0 && (filter || searchText) && (
        <div className="flex flex-wrap items-center justify-between gap-3">
          {filter ? (
            <div role="group" aria-label={filter.label} className="flex flex-wrap gap-2">
              {[{ value: "all", label: "All" }, ...filter.options].map((option) => {
                const active = filterValue === option.value
                return (
                  <button key={option.value} type="button" aria-pressed={active} className={pillClass(active)}
                    onClick={() => { setFilterValue(option.value); setPage(0) }}>
                    {option.label}
                    <span className="text-xs text-muted-foreground tabular-nums">
                      {option.value === "all" ? rows.length : filterCounts.get(option.value) ?? 0}
                    </span>
                  </button>
                )
              })}
            </div>
          ) : <span />}
          {searchText && (
            <div className="relative w-full sm:w-80">
              <Search aria-hidden className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input type="search" value={query} placeholder={searchPlaceholder} aria-label={searchLabel ?? searchPlaceholder} className="pl-9"
                onChange={(event) => { setQuery(event.target.value); setPage(0) }} />
            </div>
          )}
        </div>
      )}

      <div className="overflow-hidden rounded-xl border border-border bg-card shadow-sm">
        {sorted.length > 0 ? (
          <Table>
            <caption className="sr-only">{caption}</caption>
            <TableHeader>
              <TableRow className="bg-muted/40 hover:bg-muted/40">
                {columns.map((column) => {
                  const direction = sort?.columnId === column.id ? sort.direction : null
                  return (
                    <TableHead key={column.id} className={column.className}
                      aria-sort={column.sortValue ? (direction === "asc" ? "ascending" : direction === "desc" ? "descending" : "none") : undefined}>
                      {column.sortValue ? (
                        <button type="button" onClick={() => toggleSort(column.id)}
                          className={cn("-mx-2 inline-flex items-center gap-1.5 rounded-md px-2 py-1 transition-colors outline-none hover:text-foreground focus-visible:ring-[3px] focus-visible:ring-ring/50", direction && "text-foreground")}>
                          {column.header}
                          {direction === "asc" ? <ArrowUp aria-hidden className="size-3.5" />
                            : direction === "desc" ? <ArrowDown aria-hidden className="size-3.5" />
                            : <ArrowUpDown aria-hidden className="size-3.5 opacity-50" />}
                        </button>
                      ) : column.header}
                    </TableHead>
                  )
                })}
                {detail && <TableHead className="hidden w-10 sm:table-cell"><span className="sr-only">Open details</span></TableHead>}
              </TableRow>
            </TableHeader>
            <TableBody>
              {view.rows.map((row) => {
                const id = getRowId(row)
                return (
                  <TableRow key={id} data-state={open && id === selectedId ? "selected" : undefined}
                    className={cn("group/row", detail && "cursor-pointer")}
                    // Pointer users can click anywhere on the row; keyboard users use the button in the first cell.
                    onClick={detail ? () => { if (!window.getSelection()?.toString()) openRow(id) } : undefined}>
                    {columns.map((column, index) => (
                      <TableCell key={column.id} className={column.className}>
                        {detail && index === 0 ? (
                          <button type="button" aria-haspopup="dialog"
                            ref={(element) => { if (element) triggers.current.set(id, element); else triggers.current.delete(id) }}
                            className="block w-full rounded-md text-left outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50">
                            {column.cell(row)}
                          </button>
                        ) : column.cell(row)}
                      </TableCell>
                    ))}
                    {detail && (
                      <TableCell className="hidden w-10 pr-4 pl-0 sm:table-cell">
                        <ChevronRight aria-hidden className="ml-auto size-4 text-muted-foreground transition-transform group-hover/row:translate-x-0.5 group-hover/row:text-foreground" />
                      </TableCell>
                    )}
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
        ) : (
          <div className="px-6 py-14 text-center text-sm text-muted-foreground">
            {rows.length === 0 ? emptyMessage : (
              <div className="space-y-2">
                <p>No results{query.trim() ? <> for “{query.trim()}”</> : null}.</p>
                <Button type="button" variant="link" size="sm" onClick={() => { setQuery(""); setFilterValue("all"); setPage(0) }}>
                  Clear search and filters
                </Button>
              </div>
            )}
          </div>
        )}
        {sorted.length > 0 && (
          <div className="flex flex-wrap items-center justify-between gap-3 border-t border-border px-4 py-3 text-sm text-muted-foreground">
            <span>{summary}</span>
            {view.pageCount > 1 && (
              <div className="flex items-center gap-2">
                <Button type="button" variant="outline" size="sm" className="border-border" disabled={view.page === 0} onClick={() => setPage(view.page - 1)}>Previous</Button>
                <span className="px-1 tabular-nums">Page {view.page + 1} of {view.pageCount}</span>
                <Button type="button" variant="outline" size="sm" className="border-border" disabled={view.page >= view.pageCount - 1} onClick={() => setPage(view.page + 1)}>Next</Button>
              </div>
            )}
          </div>
        )}
      </div>
      <p className="sr-only" role="status">{summary}</p>

      {detail && (
        <DetailDrawer
          open={open && selectedRow !== undefined}
          onOpenChange={setOpen}
          title={selectedRow === undefined ? null : detail.title(selectedRow)}
          description={selectedRow === undefined ? undefined : detail.description?.(selectedRow)}
          badge={selectedRow === undefined ? undefined : detail.badge?.(selectedRow)}
          footer={selectedRow === undefined ? undefined : detail.footer?.(selectedRow)}
          contentKey={selectedId ?? undefined}
          navigation={selectedIndex === -1 ? undefined : {
            position: selectedIndex + 1,
            total,
            onPrevious: selectedIndex > 0 ? () => step(-1) : undefined,
            onNext: selectedIndex < total - 1 ? () => step(1) : undefined,
          }}
          onCloseAutoFocus={(event) => {
            event.preventDefault()
            if (selectedId !== null) triggers.current.get(selectedId)?.focus()
          }}
        >
          {selectedRow === undefined ? null : detail.content(selectedRow)}
        </DetailDrawer>
      )}
    </div>
  )
}
