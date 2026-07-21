import { useMemo, useState, type ReactNode } from "react";
import { IconSearch, IconDownload, IconChevronUp, IconChevronDown } from "@tabler/icons-react";

export type Column<T> = {
  key: string;
  label: string;
  render?: (row: T) => ReactNode;
  sortValue?: (row: T) => string | number | null | undefined;
  csvValue?: (row: T) => string | number | null | undefined;
  className?: string;
  align?: "left" | "right";
};

type Props<T> = {
  data: T[] | undefined;
  columns: Column<T>[];
  isLoading?: boolean;
  searchable?: (row: T) => string;
  filters?: ReactNode;
  pageSize?: number;
  filename?: string;
  rowKey: (row: T) => string;
  emptyLabel?: string;
  toolbar?: ReactNode;
};

function toCsv<T>(rows: T[], columns: Column<T>[]) {
  const header = columns.map((c) => `"${c.label.replace(/"/g, '""')}"`).join(",");
  const body = rows
    .map((r) =>
      columns
        .map((c) => {
          const v = c.csvValue ? c.csvValue(r) : c.sortValue ? c.sortValue(r) : "";
          const s = v == null ? "" : String(v);
          return `"${s.replace(/"/g, '""')}"`;
        })
        .join(","),
    )
    .join("\n");
  return header + "\n" + body;
}

export function DataTable<T>({
  data,
  columns,
  isLoading,
  searchable,
  filters,
  pageSize = 20,
  filename = "export.csv",
  rowKey,
  emptyLabel = "Aucun résultat.",
  toolbar,
}: Props<T>) {
  const [q, setQ] = useState("");
  const [sort, setSort] = useState<{ key: string; dir: "asc" | "desc" } | null>(null);
  const [page, setPage] = useState(1);

  const filtered = useMemo(() => {
    if (!data) return [] as T[];
    const s = q.trim().toLowerCase();
    if (!s || !searchable) return data;
    return data.filter((r) => searchable(r).toLowerCase().includes(s));
  }, [data, q, searchable]);

  const sorted = useMemo(() => {
    if (!sort) return filtered;
    const col = columns.find((c) => c.key === sort.key);
    if (!col?.sortValue) return filtered;
    const dir = sort.dir === "asc" ? 1 : -1;
    return [...filtered].sort((a, b) => {
      const va = col.sortValue!(a);
      const vb = col.sortValue!(b);
      if (va == null && vb == null) return 0;
      if (va == null) return 1;
      if (vb == null) return -1;
      if (typeof va === "number" && typeof vb === "number") return (va - vb) * dir;
      return String(va).localeCompare(String(vb)) * dir;
    });
  }, [filtered, sort, columns]);

  const totalPages = Math.max(1, Math.ceil(sorted.length / pageSize));
  const current = Math.min(page, totalPages);
  const pageRows = sorted.slice((current - 1) * pageSize, current * pageSize);

  function toggleSort(key: string) {
    setPage(1);
    setSort((s) =>
      s?.key === key
        ? s.dir === "asc"
          ? { key, dir: "desc" }
          : null
        : { key, dir: "asc" },
    );
  }

  function exportCsv() {
    const csv = toCsv(sorted, columns);
    const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center gap-2">
        {searchable && (
          <div className="relative">
            <IconSearch size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input
              value={q}
              onChange={(e) => {
                setPage(1);
                setQ(e.target.value);
              }}
              placeholder="Rechercher…"
              className="w-60 rounded-full border border-border/60 bg-white py-1.5 pl-8 pr-3 text-sm"
            />
          </div>
        )}
        {filters}
        <div className="ml-auto flex items-center gap-2">
          {toolbar}
          <button
            onClick={exportCsv}
            disabled={!sorted.length}
            className="inline-flex items-center gap-1.5 rounded-full border border-border/60 bg-white px-3 py-1.5 text-[12px] hover:bg-secondary disabled:opacity-50"
          >
            <IconDownload size={13} /> CSV
          </button>
        </div>
      </div>

      <div className="overflow-hidden rounded-2xl border border-border/60 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-neutral-50 text-left text-[11px] uppercase tracking-wider text-muted-foreground">
              <tr>
                {columns.map((c) => {
                  const active = sort?.key === c.key;
                  const sortable = Boolean(c.sortValue);
                  return (
                    <th
                      key={c.key}
                      className={`px-4 py-3 ${c.align === "right" ? "text-right" : ""} ${c.className ?? ""}`}
                    >
                      {sortable ? (
                        <button
                          onClick={() => toggleSort(c.key)}
                          className="inline-flex items-center gap-1 hover:text-foreground"
                        >
                          {c.label}
                          {active && (sort!.dir === "asc" ? <IconChevronUp size={12} /> : <IconChevronDown size={12} />)}
                        </button>
                      ) : (
                        c.label
                      )}
                    </th>
                  );
                })}
              </tr>
            </thead>
            <tbody className="divide-y divide-border/60">
              {isLoading && (
                <tr>
                  <td colSpan={columns.length} className="px-4 py-6 text-center text-muted-foreground">
                    Chargement…
                  </td>
                </tr>
              )}
              {!isLoading &&
                pageRows.map((row) => (
                  <tr key={rowKey(row)} className="hover:bg-neutral-50/60">
                    {columns.map((c) => (
                      <td
                        key={c.key}
                        className={`px-4 py-3 ${c.align === "right" ? "text-right" : ""} ${c.className ?? ""}`}
                      >
                        {c.render ? c.render(row) : (c.sortValue ? String(c.sortValue(row) ?? "") : "")}
                      </td>
                    ))}
                  </tr>
                ))}
              {!isLoading && pageRows.length === 0 && (
                <tr>
                  <td colSpan={columns.length} className="px-4 py-6 text-center text-muted-foreground">
                    {emptyLabel}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {sorted.length > pageSize && (
        <div className="flex items-center justify-between text-[12px] text-muted-foreground">
          <span>
            {(current - 1) * pageSize + 1}–{Math.min(current * pageSize, sorted.length)} sur {sorted.length}
          </span>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={current === 1}
              className="rounded-full border border-border/60 bg-white px-3 py-1 hover:bg-secondary disabled:opacity-40"
            >
              Précédent
            </button>
            <span className="px-2">
              {current} / {totalPages}
            </span>
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={current === totalPages}
              className="rounded-full border border-border/60 bg-white px-3 py-1 hover:bg-secondary disabled:opacity-40"
            >
              Suivant
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
