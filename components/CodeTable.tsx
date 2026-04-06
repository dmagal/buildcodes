import { CodeTable as CodeTableType } from '@/lib/types';

export default function CodeTable({ table }: { table: CodeTableType }) {
  if (!table.headers?.length) return null;

  return (
    <div className="overflow-x-auto rounded-lg border border-slate-200">
      {(table.id || table.title) && (
        <div className="px-4 py-2 bg-slate-50 border-b border-slate-200">
          {table.id && (
            <span className="font-mono text-xs text-slate-500 mr-2">{table.id}</span>
          )}
          {table.title && (
            <span className="text-sm font-semibold text-slate-700">{table.title}</span>
          )}
        </div>
      )}
      <table className="w-full text-sm">
        <thead>
          <tr className="bg-slate-100">
            {table.headers.map((header: string, i: number) => (
              <th
                key={i}
                className="px-4 py-2.5 text-left text-xs font-semibold text-slate-600 uppercase tracking-wide border-b border-slate-200"
              >
                {header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {table.rows.map((row: string[], ri: number) => (
            <tr key={ri} className="hover:bg-slate-50 transition-colors">
              {Array.isArray(row) ? (
                row.map((cell: string, ci: number) => (
                  <td key={ci} className="px-4 py-2.5 text-slate-700 align-top">
                    {cell}
                  </td>
                ))
              ) : (
                // Fallback: if a row somehow came in as a string, show it spanning all columns
                <td colSpan={table.headers.length} className="px-4 py-2.5 text-slate-700">
                  {String(row)}
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
