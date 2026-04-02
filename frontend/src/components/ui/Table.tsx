import React from 'react';

interface Column<T> {
  key: string;
  title: string;
  render?: (item: T) => React.ReactNode;
  className?: string;
}

interface TableProps<T> {
  columns: Column<T>[];
  data: T[];
  renderRow?: (item: T) => React.ReactNode;
  emptyMessage?: string;
  onRowClick?: (item: T) => void;
  loading?: boolean;
}

function Table<T>({
  columns,
  data,
  emptyMessage = 'لا توجد بيانات',
  onRowClick,
  loading = false,
}: TableProps<T>) {
  if (loading) {
    return (
      <div className="flex items-center justify-center p-12">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin w-10 h-10 border-4 border-primary-500 border-t-transparent rounded-full"></div>
          <p className="font-bold text-brand-accent/50">جاري التحميل...</p>
        </div>
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div className="flex items-center justify-center p-12">
        <div className="text-center text-brand-accent/40 font-bold">
          <p className="text-lg">{emptyMessage}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full" dir="rtl">
        <thead className="bg-brand-dark/30 border-b border-brand-border/30">
          <tr>
            {columns.map((col) => (
              <th
                key={col.key}
                className={`px-4 py-3 text-right text-[10px] font-black text-brand-accent/40 uppercase tracking-widest ${col.className || ''}`}
              >
                {col.title}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-brand-border/10">
          {data.map((item, index) => (
            <tr
              key={index}
              className={`hover:bg-brand-dark/20 transition-colors group ${onRowClick ? 'cursor-pointer' : ''}`}
              onClick={() => onRowClick?.(item)}
            >
              {columns.map((col) => (
                <td
                  key={col.key}
                  className={`px-4 py-3 text-sm ${col.className || ''}`}
                >
                  {col.render ? col.render(item) : (item as any)[col.key]}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default Table;
