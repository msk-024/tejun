import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import type { Components } from "react-markdown";

const components: Components = {
  h1: ({ children }) => (
    <h1 className="text-2xl font-bold mt-6 mb-3">{children}</h1>
  ),
  h2: ({ children }) => (
    <h2 className="text-xl font-bold mt-5 mb-2">{children}</h2>
  ),
  h3: ({ children }) => (
    <h3 className="text-lg font-bold mt-4 mb-2">{children}</h3>
  ),
  p: ({ children }) => <p className="mb-3 leading-relaxed">{children}</p>,
  ul: ({ children }) => (
    <ul className="list-disc list-inside mb-3 space-y-1">{children}</ul>
  ),
  ol: ({ children }) => (
    <ol className="list-decimal list-inside mb-3 space-y-1">{children}</ol>
  ),
  li: ({ children }) => <li className="ml-2">{children}</li>,
  a: ({ href, children }) => (
    <a
      href={href}
      className="text-[#2d6a4f] underline hover:no-underline"
      target="_blank"
      rel="noopener noreferrer"
    >
      {children}
    </a>
  ),
  blockquote: ({ children }) => (
    <blockquote className="border-l-4 border-[#2d6a4f]/30 pl-4 my-3 text-muted-foreground italic">
      {children}
    </blockquote>
  ),
  code: ({ className, children }) => {
    const isInline = !className;
    return isInline ? (
      <code className="bg-gray-100 text-[#2d6a4f] px-1.5 py-0.5 rounded text-[0.9em] font-mono">
        {children}
      </code>
    ) : (
      <code className={`block font-mono text-sm ${className ?? ""}`}>
        {children}
      </code>
    );
  },
  pre: ({ children }) => (
    <pre className="bg-gray-900 text-gray-100 rounded-md p-4 mb-3 overflow-x-auto text-sm">
      {children}
    </pre>
  ),
  // 表は列が増えると本文幅を突き破るため、表だけを横スクロールさせる
  table: ({ children }) => (
    <div className="overflow-x-auto mb-4">
      <table className="w-full border-collapse text-sm">{children}</table>
    </div>
  ),
  thead: ({ children }) => <thead className="bg-gray-50">{children}</thead>,
  th: ({ children }) => (
    <th className="border border-border px-3 py-2 text-left font-semibold align-top">
      {children}
    </th>
  ),
  td: ({ children }) => (
    <td className="border border-border px-3 py-2 align-top">{children}</td>
  ),
};

type Props = {
  content: string;
};

export default function MarkdownRenderer({ content }: Props) {
  if (!content.trim()) {
    return (
      <p className="text-muted-foreground text-sm">本文はまだありません。</p>
    );
  }

  return (
    <div className="text-base">
      <ReactMarkdown remarkPlugins={[remarkGfm]} components={components}>
        {content}
      </ReactMarkdown>
    </div>
  );
}
