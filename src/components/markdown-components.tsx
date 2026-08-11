import type { Components } from "react-markdown";

export const mdComponents: Components = {
  table: ({ children }) => (
    <div className="my-4 overflow-x-auto rounded-lg border border-border">
      <table className="w-full min-w-[420px] border-collapse text-sm">{children}</table>
    </div>
  ),
  thead: ({ children }) => <thead className="bg-muted text-muted-foreground">{children}</thead>,
  th: ({ children }) => (
    <th className="border-b border-border px-3 py-2 text-left text-xs font-semibold uppercase tracking-wide">
      {children}
    </th>
  ),
  td: ({ children }) => <td className="border-b border-border px-3 py-2 align-top">{children}</td>,
  tr: ({ children }) => <tr className="odd:bg-card even:bg-muted/20">{children}</tr>,
};
