import { useState, useCallback, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import ReactMarkdown from 'react-markdown'
import { cn } from '../../../lib/utils'

// Simple syntax highlighting for common languages
const highlightCode = (code, language) => {
  if (!code) return code

  const keywords = {
    javascript: ['const', 'let', 'var', 'function', 'return', 'if', 'else', 'for', 'while', 'class', 'import', 'export', 'from', 'default', 'async', 'await', 'try', 'catch', 'throw', 'new', 'this', 'true', 'false', 'null', 'undefined'],
    typescript: ['const', 'let', 'var', 'function', 'return', 'if', 'else', 'for', 'while', 'class', 'import', 'export', 'from', 'default', 'async', 'await', 'try', 'catch', 'throw', 'new', 'this', 'true', 'false', 'null', 'undefined', 'interface', 'type', 'enum', 'implements', 'extends'],
    python: ['def', 'class', 'if', 'elif', 'else', 'for', 'while', 'return', 'import', 'from', 'as', 'try', 'except', 'finally', 'with', 'lambda', 'True', 'False', 'None', 'and', 'or', 'not', 'in', 'is', 'async', 'await'],
    jsx: ['const', 'let', 'var', 'function', 'return', 'if', 'else', 'for', 'while', 'class', 'import', 'export', 'from', 'default', 'async', 'await', 'try', 'catch', 'throw', 'new', 'this', 'true', 'false', 'null', 'undefined'],
  }

  const lang = language?.toLowerCase() || 'javascript'
  const langKeywords = keywords[lang] || keywords.javascript

  // Escape HTML
  let highlighted = code
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')

  // Highlight strings (single and double quotes)
  highlighted = highlighted.replace(
    /(["'`])(?:(?!\1)[^\\]|\\.)*\1/g,
    '<span class="text-emerald-600 dark:text-emerald-400">$&</span>'
  )

  // Highlight comments
  highlighted = highlighted.replace(
    /(\/\/.*$|\/\*[\s\S]*?\*\/|#.*$)/gm,
    '<span class="text-text-muted italic">$&</span>'
  )

  // Highlight numbers
  highlighted = highlighted.replace(
    /\b(\d+\.?\d*)\b/g,
    '<span class="text-amber-600 dark:text-amber-400">$1</span>'
  )

  // Highlight keywords
  const keywordRegex = new RegExp(`\\b(${langKeywords.join('|')})\\b`, 'g')
  highlighted = highlighted.replace(
    keywordRegex,
    '<span class="text-purple-600 dark:text-purple-400 font-medium">$1</span>'
  )

  return highlighted
}

// Code block component with copy button
const CodeBlock = ({ code, language }) => {
  const { t } = useTranslation()
  const [copied, setCopied] = useState(false)

  const handleCopy = useCallback(() => {
    navigator.clipboard.writeText(code)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }, [code])

  const highlightedCode = useMemo(() => highlightCode(code, language), [code, language])

  return (
    <div className="relative group my-4">
      {/* Language badge */}
      {language && (
        <div className="absolute top-0 left-0 px-3 py-1.5 text-xs text-text-muted bg-bg-hover/80 rounded-tl-lg rounded-br-lg font-mono">
          {language}
        </div>
      )}

      {/* Copy button */}
      <button
        onClick={handleCopy}
        className={cn("absolute top-2 right-2 p-1.5 rounded-md","bg-bg-hover/80 hover:bg-bg-hover","text-text-muted hover:text-text-primary","opacity-0 group-hover:opacity-100","transition-all duration-200","flex items-center justify-center"
        )}
        data-tooltip={copied ? t('common.copied') : t('common.copy')}
        data-tooltip-position="left"
      >
        {copied ? (
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="20 6 9 17 4 12" />
          </svg>
        ) : (
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect width="14" height="14" x="8" y="8" rx="2" ry="2" />
            <path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2" />
          </svg>
        )}
      </button>

      {/* Code content */}
      <pre className={cn("bg-bg-secondary rounded-lg overflow-x-auto",
        language ?"pt-10 pb-4 px-4" :"py-4 px-4","text-sm font-mono leading-relaxed","border border-border-light"
      )}>
        <code
          className="text-text-primary whitespace-pre"
          dangerouslySetInnerHTML={{ __html: highlightedCode }}
        />
      </pre>
    </div>
  )
}

// Auto-complete incomplete markdown during streaming
const completeMarkdown = (content) => {
  if (!content) return content

  let result = content

  // Complete incomplete bold
  const boldMatches = result.match(/\*\*/g)
  if (boldMatches && boldMatches.length % 2 !== 0) {
    result += '**'
  }

  // Complete incomplete italic
  const italicMatches = result.match(/(?<!\*)\*(?!\*)/g)
  if (italicMatches && italicMatches.length % 2 !== 0) {
    result += '*'
  }

  // Complete incomplete inline code
  const codeMatches = result.match(/`(?!``)/g)
  if (codeMatches && codeMatches.length % 2 !== 0) {
    result += '`'
  }

  // Complete incomplete code blocks
  const codeBlockMatches = result.match(/```/g)
  if (codeBlockMatches && codeBlockMatches.length % 2 !== 0) {
    result += '\n```'
  }

  // Complete incomplete links - hide broken links during streaming
  const linkMatch = result.match(/\[([^\]]*)\](?:\([^)]*)?$/)
  if (linkMatch) {
    result = result.replace(/\[([^\]]*)\](?:\([^)]*)?$/, '$1')
  }

  return result
}

// Main MarkdownResponse component
const MarkdownResponse = ({
  children,
  className,
  streaming = false
}) => {
  const content = useMemo(() => {
    if (streaming) {
      return completeMarkdown(children)
    }
    return children
  }, [children, streaming])

  const components = useMemo(() => ({
    // Code - check if inside pre (code block) or not (inline)
    code({ node, className, children, ...props }) {
      const match = /language-(\w+)/.exec(className || '')
      const language = match ? match[1] : ''
      const codeString = String(children).replace(/\n$/, '')

      // Check if this is a code block (has language or multiline)
      const isCodeBlock = match || codeString.includes('\n')

      if (isCodeBlock) {
        return <CodeBlock code={codeString} language={language} />
      }

      // Inline code
      return (
        <code
          className={cn("bg-bg-secondary/80 py-0.5 px-1.5 rounded","font-mono text-[0.9em]","text-text-primary"
          )}
          {...props}
        >
          {children}
        </code>
      )
    },
    // Pre - just render children (CodeBlock handles styling)
    pre({ children }) {
      return <>{children}</>
    },
    // Paragraphs
    p({ children }) {
      return <p className="mb-4 last:mb-0 leading-relaxed">{children}</p>
    },
    // Headings
    h1({ children }) {
      return <h1 className="text-2xl font-semibold mt-6 mb-4 first:mt-0">{children}</h1>
    },
    h2({ children }) {
      return <h2 className="text-xl font-semibold mt-5 mb-3 first:mt-0">{children}</h2>
    },
    h3({ children }) {
      return <h3 className="text-lg font-semibold mt-4 mb-2 first:mt-0">{children}</h3>
    },
    // Lists
    ul({ children }) {
      return <ul className="my-3 pl-6 list-disc space-y-1">{children}</ul>
    },
    ol({ children }) {
      return <ol className="my-3 pl-6 list-decimal space-y-1">{children}</ol>
    },
    li({ children }) {
      return <li className="leading-relaxed">{children}</li>
    },
    // Blockquote
    blockquote({ children }) {
      return (
        <blockquote className={cn("border-l-3 border-primary pl-4 my-4","text-text-secondary italic"
        )}>
          {children}
        </blockquote>
      )
    },
    // Links
    a({ href, children }) {
      return (
        <a
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          className="text-primary hover:underline"
        >
          {children}
        </a>
      )
    },
    // Tables
    table({ children }) {
      return (
        <div className="my-4 overflow-x-auto rounded-lg border border-border-light">
          <table className="w-full border-collapse text-sm">
            {children}
          </table>
        </div>
      )
    },
    thead({ children }) {
      return <thead className="bg-bg-secondary">{children}</thead>
    },
    th({ children }) {
      return (
        <th className="px-4 py-2.5 text-left font-medium text-text-primary border-b border-border-light">
          {children}
        </th>
      )
    },
    td({ children }) {
      return (
        <td className="px-4 py-2.5 text-text-primary border-b border-border-light">
          {children}
        </td>
      )
    },
    tr({ children }) {
      return <tr className="hover:bg-bg-hover/50 transition-colors">{children}</tr>
    },
    tbody({ children }) {
      return <tbody className="[&>tr:last-child>td]:border-b-0">{children}</tbody>
    },
    // Horizontal rule - hidden
    hr() {
      return null
    },
    // Strong and emphasis
    strong({ children }) {
      return <strong className="font-semibold">{children}</strong>
    },
    em({ children }) {
      return <em className="italic">{children}</em>
    }
  }), [])

  return (
    <div className={cn("text-base leading-relaxed text-text-primary","max-w-none",
      className
    )}>
      <ReactMarkdown components={components}>
        {content}
      </ReactMarkdown>
    </div>
  )
}

export default MarkdownResponse
