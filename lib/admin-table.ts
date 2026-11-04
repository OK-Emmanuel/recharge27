export type SortDirection = "asc" | "desc"
export type SortValue = string | number | null | undefined

const collator = new Intl.Collator("en", { sensitivity: "base", numeric: true })

function isEmpty(value: SortValue): value is null | undefined | "" {
  return value === null || value === undefined || value === ""
}

function compare(a: string | number, b: string | number): number {
  return typeof a === "number" && typeof b === "number" ? a - b : collator.compare(String(a), String(b))
}

// Empty values always sort last, whichever direction is chosen. The sort is stable.
export function sortRows<T>(rows: readonly T[], getValue: (row: T) => SortValue, direction: SortDirection): T[] {
  const factor = direction === "asc" ? 1 : -1
  return rows
    .map((row) => ({ row, value: getValue(row) }))
    .sort((a, b) => {
      if (isEmpty(a.value) || isEmpty(b.value)) return isEmpty(a.value) === isEmpty(b.value) ? 0 : isEmpty(a.value) ? 1 : -1
      return factor * compare(a.value, b.value)
    })
    .map(({ row }) => row)
}

// Every whitespace-separated term must appear somewhere in the row's text, in any order.
export function filterByQuery<T>(rows: readonly T[], query: string, getText: (row: T) => string): T[] {
  const terms = query.toLowerCase().split(/\s+/).filter(Boolean)
  if (!terms.length) return [...rows]
  return rows.filter((row) => {
    const text = getText(row).toLowerCase()
    return terms.every((term) => text.includes(term))
  })
}

export type Page<T> = {
  rows: T[]
  page: number
  pageCount: number
  /** Zero-based index of the first row on this page within the full list. */
  start: number
}

// The page is clamped so a shrinking list never leaves the user on an empty page.
export function paginate<T>(rows: readonly T[], page: number, pageSize?: number): Page<T> {
  if (!pageSize || !Number.isFinite(pageSize) || pageSize < 1) return { rows: [...rows], page: 0, pageCount: 1, start: 0 }
  const size = Math.floor(pageSize)
  const pageCount = Math.max(1, Math.ceil(rows.length / size))
  const current = Math.min(Math.max(0, Math.floor(page) || 0), pageCount - 1)
  const start = current * size
  return { rows: rows.slice(start, start + size), page: current, pageCount, start }
}

// The page that holds the row at `index`, so stepping through a list keeps that row visible.
export function pageForIndex(index: number, pageSize?: number): number {
  return pageSize && Number.isFinite(pageSize) && pageSize >= 1 ? Math.floor(index / Math.floor(pageSize)) : 0
}
