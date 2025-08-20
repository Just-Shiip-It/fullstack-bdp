import { ReactNode } from 'react';

interface AdminTableProps {
  headers: string[];
  children: ReactNode;
  className?: string;
}

export default function AdminTable({ headers, children, className = '' }: AdminTableProps) {
  return (
    <div className={`overflow-hidden rounded-xl border border-white/10 ${className}`}>
      <table className="table w-full border-collapse">
        <thead className="bg-white/6 text-slate-300">
          <tr>
            {headers.map((header, index) => (
              <th key={index} className="text-left px-4 py-3 text-sm font-medium">
                {header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-white/10">
          {children}
        </tbody>
      </table>
    </div>
  );
}
