import React from 'react';
import katex from 'katex';
import { Lightbulb, Info, AlertTriangle, Bookmark } from 'lucide-react';

/**
 * Render inline tokens recursively:
 * - **bold** (can contain math inside!)
 * - $math$ (inline KaTeX)
 * - `code`
 */
export function renderInlineContent(text, keyPrefix = 'inl') {
  if (!text) return null;

  // Master inline regex matching bold **...**, inline code `...`, inline math $...$
  const regex = /(\*\*[\s\S]*?\*\*|`[^`]*?`|\$[^\$]+?\$)/g;
  const parts = [];
  let lastIdx = 0;
  let match;

  while ((match = regex.exec(text)) !== null) {
    if (match.index > lastIdx) {
      parts.push({ type: 'text', content: text.slice(lastIdx, match.index) });
    }
    const token = match[0];
    if (token.startsWith('**') && token.endsWith('**')) {
      const inner = token.slice(2, -2);
      parts.push({ type: 'bold', inner });
    } else if (token.startsWith('`') && token.endsWith('`')) {
      parts.push({ type: 'code', content: token.slice(1, -1) });
    } else if (token.startsWith('$') && token.endsWith('$')) {
      parts.push({ type: 'math', content: token.slice(1, -1) });
    }
    lastIdx = regex.lastIndex;
  }
  if (lastIdx < text.length) {
    parts.push({ type: 'text', content: text.slice(lastIdx) });
  }

  return parts.map((part, pIdx) => {
    if (part.type === 'bold') {
      return (
        <strong
          key={`${keyPrefix}-b-${pIdx}`}
          className="font-semibold text-slate-900"
          style={{ fontWeight: 700, color: '#0F172A' }}
        >
          {renderInlineContent(part.inner, `${keyPrefix}-b-${pIdx}`)}
        </strong>
      );
    }
    if (part.type === 'math') {
      let html = '';
      try {
        html = katex.renderToString(part.content, { displayMode: false, throwOnError: false });
      } catch (e) {
        html = part.content;
      }
      return (
        <span
          key={`${keyPrefix}-math-${pIdx}`}
          className="inline-math mx-0.5 inline-block"
          dangerouslySetInnerHTML={{ __html: html }}
        />
      );
    }
    if (part.type === 'code') {
      return (
        <code
          key={`${keyPrefix}-code-${pIdx}`}
          style={{
            background: '#F1F5F9',
            color: '#4338CA',
            padding: '1px 6px',
            borderRadius: '4px',
            fontFamily: 'monospace',
            fontSize: '0.9em'
          }}
        >
          {part.content}
        </code>
      );
    }
    return <span key={`${keyPrefix}-txt-${pIdx}`}>{part.content}</span>;
  });
}

/**
 * Split text into Markdown blocks (headings, callouts, lists, hr, display math, paragraphs)
 */
function parseMarkdownBlocks(text) {
  if (!text) return [];
  const lines = text.split(/\r?\n/);
  const blocks = [];
  let i = 0;

  while (i < lines.length) {
    const line = lines[i];
    const trimmed = line.trim();

    if (!trimmed) {
      i++;
      continue;
    }

    // Display math $$...$$
    if (trimmed.startsWith('$$')) {
      if (trimmed.endsWith('$$') && trimmed.length > 2) {
        blocks.push({ type: 'math-display', content: trimmed.slice(2, -2).trim() });
        i++;
        continue;
      } else {
        let mathContent = trimmed.slice(2);
        i++;
        while (i < lines.length && !lines[i].trim().endsWith('$$')) {
          mathContent += '\n' + lines[i];
          i++;
        }
        if (i < lines.length) {
          const endLine = lines[i].trim();
          mathContent += '\n' + endLine.slice(0, -2);
          i++;
        }
        blocks.push({ type: 'math-display', content: mathContent.trim() });
        continue;
      }
    }

    // Horizontal rule
    if (/^(\-{3,}|\*{3,}|_{3,})$/.test(trimmed)) {
      blocks.push({ type: 'hr' });
      i++;
      continue;
    }

    // Headings: #, ##, ###, ####
    const headingMatch = line.match(/^(#{1,6})\s+(.+)$/);
    if (headingMatch) {
      blocks.push({
        type: 'heading',
        level: headingMatch[1].length,
        text: headingMatch[2].trim()
      });
      i++;
      continue;
    }

    // Callout / Blockquote: > [!TIP], > [!NOTE], etc.
    if (trimmed.startsWith('>')) {
      let calloutType = 'quote';
      const calloutLines = [];
      
      const firstLineContent = trimmed.replace(/^>\s*/, '');
      const alertMatch = firstLineContent.match(/^\[!(TIP|NOTE|IMPORTANT|WARNING|CAUTION)\]/i);
      if (alertMatch) {
        calloutType = alertMatch[1].toUpperCase();
      } else {
        calloutLines.push(firstLineContent);
      }

      i++;
      while (i < lines.length && lines[i].trim().startsWith('>')) {
        calloutLines.push(lines[i].trim().replace(/^>\s*/, ''));
        i++;
      }

      blocks.push({
        type: 'callout',
        kind: calloutType,
        text: calloutLines.join('\n').trim()
      });
      continue;
    }

    // Ordered list: 1. Item
    if (/^\s*\d+\.\s+(.+)$/.test(line)) {
      const items = [];
      while (i < lines.length && /^\s*\d+\.\s+(.+)$/.test(lines[i])) {
        const itemMatch = lines[i].match(/^\s*\d+\.\s+(.+)$/);
        items.push(itemMatch[1].trim());
        i++;
      }
      blocks.push({ type: 'ol', items });
      continue;
    }

    // Unordered list: - Item or * Item
    if (/^\s*[-*+]\s+(.+)$/.test(line)) {
      const items = [];
      while (i < lines.length && /^\s*[-*+]\s+(.+)$/.test(lines[i])) {
        const itemMatch = lines[i].match(/^\s*[-*+]\s+(.+)$/);
        items.push(itemMatch[1].trim());
        i++;
      }
      blocks.push({ type: 'ul', items });
      continue;
    }

    // Regular paragraph
    const pLines = [trimmed];
    i++;
    while (
      i < lines.length &&
      lines[i].trim() &&
      !lines[i].trim().startsWith('#') &&
      !lines[i].trim().startsWith('>') &&
      !lines[i].trim().startsWith('$$') &&
      !/^(\-{3,}|\*{3,}|_{3,})$/.test(lines[i].trim()) &&
      !/^\s*\d+\.\s+/.test(lines[i]) &&
      !/^\s*[-*+]\s+/.test(lines[i])
    ) {
      pLines.push(lines[i].trim());
      i++;
    }
    blocks.push({ type: 'p', text: pLines.join(' ') });
  }

  return blocks;
}

export default function MathText({ text, className = '' }) {
  if (!text) return null;

  // Check if string contains raw LaTeX commands without $ delimiters (e.g. formula sheets)
  const containsRawLatex = (str) => {
    return /\\[a-zA-Z]+/.test(str) && !str.includes('$');
  };

  if (containsRawLatex(text)) {
    const lines = text.split('\n');
    return (
      <div className={`math-content ${className}`}>
        {lines.map((line, idx) => {
          const trimmed = line.trim();
          if (!trimmed) return <div key={idx} style={{ height: '8px' }} />;

          if (/\\[a-zA-Z]+/.test(trimmed)) {
            let html = '';
            try {
              html = katex.renderToString(trimmed, { displayMode: true, throwOnError: false });
              return (
                <div 
                  key={idx} 
                  className="my-2 overflow-x-auto py-1 text-center"
                  dangerouslySetInnerHTML={{ __html: html }} 
                />
              );
            } catch (e) {
              // fallback
            }
          }
          return <div key={idx} className="my-1">{trimmed}</div>;
        })}
      </div>
    );
  }

  // Parse markdown blocks
  const blocks = parseMarkdownBlocks(text);

  // If text is just a single plain paragraph without line breaks (like quiz options or single sentences)
  if (blocks.length === 1 && blocks[0].type === 'p' && !text.includes('\n')) {
    return (
      <span className={`math-inline-wrapper ${className}`}>
        {renderInlineContent(blocks[0].text, 'single')}
      </span>
    );
  }

  // Render callout helper
  const renderCallout = (block, idx) => {
    const kind = block.kind.toUpperCase();
    let Icon = Info;
    let label = 'Ghi chú:';
    let calloutClass = 'math-callout-note';

    if (kind === 'TIP') {
      Icon = Lightbulb;
      label = 'Mẹo & Kinh nghiệm thi:';
      calloutClass = 'math-callout-tip';
    } else if (kind === 'IMPORTANT') {
      Icon = Bookmark;
      label = 'Trọng tâm quan trọng:';
      calloutClass = 'math-callout-important';
    } else if (kind === 'WARNING' || kind === 'CAUTION') {
      Icon = AlertTriangle;
      label = 'Cảnh báo & Lỗi thường gặp:';
      calloutClass = 'math-callout-warning';
    } else if (kind === 'QUOTE') {
      return (
        <blockquote key={idx} className="math-blockquote">
          {renderInlineContent(block.text, `quote-${idx}`)}
        </blockquote>
      );
    }

    return (
      <div key={idx} className={`math-callout ${calloutClass}`}>
        <div className="math-callout-header">
          <Icon size={18} style={{ flexShrink: 0 }} />
          <span>{label}</span>
        </div>
        <div className="math-callout-body">
          {renderInlineContent(block.text, `callout-${idx}`)}
        </div>
      </div>
    );
  };

  return (
    <div className={`math-content ${className}`}>
      {blocks.map((block, idx) => {
        switch (block.type) {
          case 'heading': {
            if (block.level === 1) {
              return (
                <h2 key={idx} className="math-h1">
                  {renderInlineContent(block.text, `h1-${idx}`)}
                </h2>
              );
            }
            if (block.level === 2) {
              return (
                <h3 key={idx} className="math-h2">
                  {renderInlineContent(block.text, `h2-${idx}`)}
                </h3>
              );
            }
            if (block.level === 3) {
              return (
                <h4 key={idx} className="math-h3">
                  {renderInlineContent(block.text, `h3-${idx}`)}
                </h4>
              );
            }
            return (
              <h5 key={idx} className="math-h4">
                {renderInlineContent(block.text, `h4-${idx}`)}
              </h5>
            );
          }

          case 'hr':
            return <hr key={idx} className="math-hr" />;

          case 'callout':
            return renderCallout(block, idx);

          case 'ol':
            return (
              <ol key={idx} className="math-ol">
                {block.items.map((item, itemIdx) => (
                  <li key={itemIdx}>
                    {renderInlineContent(item, `ol-${idx}-${itemIdx}`)}
                  </li>
                ))}
              </ol>
            );

          case 'ul':
            return (
              <ul key={idx} className="math-ul">
                {block.items.map((item, itemIdx) => (
                  <li key={itemIdx}>
                    {renderInlineContent(item, `ul-${idx}-${itemIdx}`)}
                  </li>
                ))}
              </ul>
            );

          case 'math-display': {
            let html = '';
            try {
              html = katex.renderToString(block.content, { displayMode: true, throwOnError: false });
            } catch (e) {
              html = block.content;
            }
            return (
              <div
                key={idx}
                className="my-3 overflow-x-auto py-1 text-center"
                dangerouslySetInnerHTML={{ __html: html }}
              />
            );
          }

          case 'p':
          default:
            return (
              <p key={idx} className="math-p">
                {renderInlineContent(block.text, `p-${idx}`)}
              </p>
            );
        }
      })}
    </div>
  );
}
