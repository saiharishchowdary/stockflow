import { ChevronLeft, ChevronRight } from 'lucide-react'

export default function Pagination({ page, pages, onPage }) {
  if (pages <= 1) return null

  const getPages = () => {
    const arr = []
    const start = Math.max(1, page - 2)
    const end = Math.min(pages, page + 2)
    if (start > 1) { arr.push(1); if (start > 2) arr.push('…') }
    for (let i = start; i <= end; i++) arr.push(i)
    if (end < pages) { if (end < pages - 1) arr.push('…'); arr.push(pages) }
    return arr
  }

  return (
    <div className="pagination">
      <button
        className="page-btn"
        onClick={() => onPage(page - 1)}
        disabled={page <= 1}
      >
        <ChevronLeft size={14} />
      </button>
      {getPages().map((p, i) =>
        p === '…' ? (
          <span key={`e-${i}`} style={{ padding: '0 4px', color: 'var(--text-muted)', fontSize: 13 }}>…</span>
        ) : (
          <button
            key={p}
            className={`page-btn ${p === page ? 'active' : ''}`}
            onClick={() => onPage(p)}
          >
            {p}
          </button>
        )
      )}
      <button
        className="page-btn"
        onClick={() => onPage(page + 1)}
        disabled={page >= pages}
      >
        <ChevronRight size={14} />
      </button>
    </div>
  )
}
