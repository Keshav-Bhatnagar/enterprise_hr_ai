import React, { useState, useMemo } from 'react';
import { ChevronUp, ChevronDown, ChevronsUpDown, Search, ChevronLeft, ChevronRight } from 'lucide-react';
import EmptyState from './EmptyState';

export function DataTable({
  columns = [],
  data = [],
  keyField = 'id',
  onRowClick,
  searchPlaceholder = 'Filter records...',
  searchKeys = [],
  pageSize = 10,
  stickyHeader = true,
  className = ''
}) {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortField, setSortField] = useState(null);
  const [sortDirection, setSortDirection] = useState('asc'); // 'asc' | 'desc'
  const [currentPage, setCurrentPage] = useState(1);

  // 1. Search filter
  const filteredData = useMemo(() => {
    if (!searchTerm.trim()) return data;
    const term = searchTerm.toLowerCase();

    return data.filter((row) => {
      if (searchKeys.length > 0) {
        return searchKeys.some((k) => String(row[k] ?? '').toLowerCase().includes(term));
      }
      return Object.values(row).some((val) => String(val ?? '').toLowerCase().includes(term));
    });
  }, [data, searchTerm, searchKeys]);

  // 2. Sorting
  const sortedData = useMemo(() => {
    if (!sortField) return filteredData;

    return [...filteredData].sort((a, b) => {
      let valA = a[sortField];
      let valB = b[sortField];

      if (typeof valA === 'number' && typeof valB === 'number') {
        return sortDirection === 'asc' ? valA - valB : valB - valA;
      }

      const strA = String(valA ?? '').toLowerCase();
      const strB = String(valB ?? '').toLowerCase();
      if (strA < strB) return sortDirection === 'asc' ? -1 : 1;
      if (strA > strB) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });
  }, [filteredData, sortField, sortDirection]);

  // 3. Pagination
  const totalPages = Math.max(1, Math.ceil(sortedData.length / pageSize));
  const paginatedData = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return sortedData.slice(start, start + pageSize);
  }, [sortedData, currentPage, pageSize]);

  const handleSort = (field) => {
    if (sortField === field) {
      if (sortDirection === 'asc') setSortDirection('desc');
      else {
        setSortField(null);
        setSortDirection('asc');
      }
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  return (
    <div className={`space-y-3 ${className}`}>
      {/* Search Bar & Counter */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="relative w-full sm:w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-text-muted" />
          <input
            type="text"
            placeholder={searchPlaceholder}
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full pl-9 pr-3 py-2 text-xs font-mono bg-surface border border-border-subtle rounded-enterprise text-text-primary placeholder:text-text-muted focus:outline-none focus:border-border-focus focus:ring-1 focus:ring-border-focus"
          />
        </div>

        <div className="text-xs text-text-secondary font-mono self-end sm:self-auto">
          Showing <span className="font-semibold text-text-primary tabular-nums">{paginatedData.length}</span> of{' '}
          <span className="font-semibold text-text-primary tabular-nums">{sortedData.length}</span> records
        </div>
      </div>

      {/* Table Container */}
      <div className="rounded-enterprise border border-border-subtle bg-card overflow-hidden shadow-card">
        <div className="overflow-x-auto max-h-[580px]">
          <table className="w-full text-left text-xs">
            <thead
              className={`border-b border-border-subtle bg-muted text-text-secondary font-mono uppercase text-[10.5px] tracking-wider select-none ${
                stickyHeader ? 'sticky top-0 z-10' : ''
              }`}
            >
              <tr>
                {columns.map((col) => {
                  const isSorted = sortField === col.key;
                  return (
                    <th
                      key={col.key}
                      onClick={() => col.sortable !== false && handleSort(col.key)}
                      className={`p-3.5 font-semibold ${
                        col.sortable !== false ? 'cursor-pointer hover:text-text-primary' : ''
                      } ${col.headerClassName || ''}`}
                    >
                      <div className="flex items-center gap-1.5">
                        <span>{col.label}</span>
                        {col.sortable !== false && (
                          <span className="text-text-muted">
                            {isSorted ? (
                              sortDirection === 'asc' ? (
                                <ChevronUp className="size-3.5 text-accent" />
                              ) : (
                                <ChevronDown className="size-3.5 text-accent" />
                              )
                            ) : (
                              <ChevronsUpDown className="size-3 opacity-40" />
                            )}
                          </span>
                        )}
                      </div>
                    </th>
                  );
                })}
              </tr>
            </thead>

            <tbody className="divide-y divide-border-subtle text-text-secondary">
              {paginatedData.length === 0 ? (
                <tr>
                  <td colSpan={columns.length} className="p-8">
                    <EmptyState
                      title="No matching records"
                      description="Try adjusting your filter or search query."
                    />
                  </td>
                </tr>
              ) : (
                paginatedData.map((row, idx) => {
                  const keyVal = row[keyField] ?? idx;
                  return (
                    <tr
                      key={keyVal}
                      onClick={() => onRowClick && onRowClick(row)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          e.preventDefault();
                          onRowClick && onRowClick(row);
                        }
                      }}
                      tabIndex={onRowClick ? 0 : undefined}
                      className={`transition-colors ${
                        onRowClick
                          ? 'cursor-pointer hover:bg-card-hover focus-visible:bg-card-hover focus-visible:outline-none'
                          : 'hover:bg-card-hover/50'
                      }`}
                    >
                      {columns.map((col) => (
                        <td key={col.key} className={`p-3.5 ${col.cellClassName || ''}`}>
                          {col.render ? col.render(row[col.key], row) : (
                            <span className="tabular-nums">{String(row[col.key] ?? '—')}</span>
                          )}
                        </td>
                      ))}
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Footer */}
        {totalPages > 1 && (
          <div className="p-3 border-t border-border-subtle bg-surface flex items-center justify-between text-xs font-mono">
            <span className="text-text-muted">
              Page <strong className="text-text-primary">{currentPage}</strong> of{' '}
              <strong className="text-text-primary">{totalPages}</strong>
            </span>

            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="p-1.5 rounded-md border border-border-subtle hover:bg-muted disabled:opacity-40 disabled:pointer-events-none text-text-primary"
                aria-label="Previous page"
              >
                <ChevronLeft className="size-4" />
              </button>
              <button
                type="button"
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="p-1.5 rounded-md border border-border-subtle hover:bg-muted disabled:opacity-40 disabled:pointer-events-none text-text-primary"
                aria-label="Next page"
              >
                <ChevronRight className="size-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default DataTable;

