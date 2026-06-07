import { Fragment } from 'react'

/**
 * Reusable data table component.
 *
 * @param {Object[]} columns  - Array of { key, label, render?, align? }
 * @param {Object[]} data     - Row data array
 * @param {boolean}  loading  - Show skeleton rows when true
 * @param {number}   skeletonRows - How many skeleton rows to show while loading
 * @param {string}   emptyMessage - Text to show when data is empty
 * @param {function} onRowClick   - Optional row click handler
 * @param {string}   rowKey       - Property name to use as React key (default "id")
 */
export default function Table({
  columns = [],
  data = [],
  loading = false,
  skeletonRows = 5,
  emptyMessage = 'No data found',
  onRowClick,
  rowKey = 'id',
}) {
  return (
    <div className="table-wrapper">
      <table>
        <thead>
          <tr>
            {columns.map((col) => (
              <th key={col.key} style={{ textAlign: col.align || 'left' }}>
                {col.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {/* ── Loading skeleton ── */}
          {loading && Array.from({ length: skeletonRows }).map((_, ri) => (
            <tr key={`skeleton-${ri}`}>
              {columns.map((col) => (
                <td key={col.key}>
                  <div
                    className="skeleton"
                    style={{
                      height: 14,
                      width: col.skeletonWidth || '80%',
                      borderRadius: 4,
                    }}
                  />
                </td>
              ))}
            </tr>
          ))}

          {/* ── Empty state ── */}
          {!loading && data.length === 0 && (
            <tr>
              <td colSpan={columns.length}>
                <div className="empty-state">
                  <p>{emptyMessage}</p>
                </div>
              </td>
            </tr>
          )}

          {/* ── Data rows ── */}
          {!loading && data.map((row) => (
            <tr
              key={row[rowKey]}
              onClick={onRowClick ? () => onRowClick(row) : undefined}
              style={{ cursor: onRowClick ? 'pointer' : 'default' }}
            >
              {columns.map((col) => (
                <td key={col.key} style={{ textAlign: col.align || 'left' }}>
                  {col.render
                    ? col.render(row[col.key], row)
                    : (row[col.key] ?? '—')}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
