function escapeHtml(value: string) {
    return value
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;');
}

function escapeAttribute(value: string) {
    return escapeHtml(value).replace(/'/g, '&#39;');
}

function safeHref(value: string) {
    const trimmed = value.trim();
    if (/^(https?:|mailto:|tel:|\/)/i.test(trimmed)) return escapeAttribute(trimmed);
    return '#';
}

function formatInlineMarkdown(value: string) {
    let text = escapeHtml(value);
    text = text.replace(/!\[([^\]]*)\]\(([^)]+)\)/g, (_, alt: string, src: string) => {
        return `<img src="${safeHref(src)}" alt="${escapeAttribute(alt)}" loading="lazy" />`;
    });
    text = text.replace(/`([^`]+)`/g, '<code>$1</code>');
    text = text.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
    text = text.replace(/__([^_]+)__/g, '<strong>$1</strong>');
    text = text.replace(/\*([^*]+)\*/g, '<em>$1</em>');
    text = text.replace(/_([^_]+)_/g, '<em>$1</em>');
    text = text.replace(/\[([^\]]+)\]\(([^)]+)\)/g, (_, label: string, href: string) => {
        return `<a href="${safeHref(href)}" target="_blank" rel="noopener noreferrer">${label}</a>`;
    });
    return text;
}

function parseTable(lines: string[], startIndex: number) {
    const header = lines[startIndex];
    const separator = lines[startIndex + 1];
    if (!header?.includes('|') || !/^\s*\|?\s*:?-{3,}:?\s*(\|\s*:?-{3,}:?\s*)+\|?\s*$/.test(separator || '')) {
        return null;
    }

    const splitRow = (row: string) => row.trim().replace(/^\|/, '').replace(/\|$/, '').split('|').map((cell) => cell.trim());
    const headers = splitRow(header);
    const rows: string[][] = [];
    let i = startIndex + 2;

    while (i < lines.length && lines[i].includes('|') && lines[i].trim()) {
        rows.push(splitRow(lines[i]));
        i += 1;
    }

    const headHtml = headers.map((cell) => `<th>${formatInlineMarkdown(cell)}</th>`).join('');
    const bodyHtml = rows.map((row) => `<tr>${headers.map((_, index) => `<td>${formatInlineMarkdown(row[index] || '')}</td>`).join('')}</tr>`).join('');
    return {
        html: `<div class="legal-table markdown-table"><table><thead><tr>${headHtml}</tr></thead><tbody>${bodyHtml}</tbody></table></div>`,
        nextIndex: i,
    };
}

export function markdownToHtml(markdown: string) {
    const lines = markdown.replace(/\r\n/g, '\n').split('\n');
    const blocks: string[] = [];
    let i = 0;
    let inCodeBlock = false;
    let codeLines: string[] = [];

    const isHeading = (line: string) => /^\s{0,3}#{1,6}\s+/.test(line);
    const isUnordered = (line: string) => /^\s{0,3}[-*+]\s+/.test(line);
    const isOrdered = (line: string) => /^\s{0,3}\d+[.)]\s+/.test(line);

    while (i < lines.length) {
        const rawLine = lines[i];
        const line = rawLine.replace(/\t/g, '    ');
        const trimmed = line.trim();

        if (trimmed.startsWith('```')) {
            if (inCodeBlock) {
                const code = escapeHtml(codeLines.join('\n'));
                blocks.push(`<pre><code>${code}</code></pre>`);
                codeLines = [];
                inCodeBlock = false;
            } else {
                inCodeBlock = true;
            }
            i += 1;
            continue;
        }

        if (inCodeBlock) {
            codeLines.push(rawLine);
            i += 1;
            continue;
        }

        if (!trimmed) {
            i += 1;
            continue;
        }

        if (/^---+$/.test(trimmed) || /^\*\*\*+$/.test(trimmed)) {
            blocks.push('<hr />');
            i += 1;
            continue;
        }

        const headingMatch = line.match(/^\s{0,3}(#{1,6})\s+(.*)$/);
        if (headingMatch) {
            const level = headingMatch[1].length;
            blocks.push(`<h${level}>${formatInlineMarkdown(headingMatch[2])}</h${level}>`);
            i += 1;
            continue;
        }

        const table = parseTable(lines, i);
        if (table) {
            blocks.push(table.html);
            i = table.nextIndex;
            continue;
        }

        if (/^\s{0,3}>\s?/.test(line)) {
            const quoteLines: string[] = [];
            while (i < lines.length && /^\s{0,3}>\s?/.test(lines[i])) {
                quoteLines.push(lines[i].replace(/^\s{0,3}>\s?/, ''));
                i += 1;
            }
            blocks.push(`<blockquote>${markdownToHtml(quoteLines.join('\n'))}</blockquote>`);
            continue;
        }

        if (isUnordered(line)) {
            const items: string[] = [];
            while (i < lines.length && isUnordered(lines[i])) {
                items.push(`<li>${formatInlineMarkdown(lines[i].replace(/^\s{0,3}[-*+]\s+/, ''))}</li>`);
                i += 1;
            }
            blocks.push(`<ul>${items.join('')}</ul>`);
            continue;
        }

        if (isOrdered(line)) {
            const items: string[] = [];
            while (i < lines.length && isOrdered(lines[i])) {
                items.push(`<li>${formatInlineMarkdown(lines[i].replace(/^\s{0,3}\d+[.)]\s+/, ''))}</li>`);
                i += 1;
            }
            blocks.push(`<ol>${items.join('')}</ol>`);
            continue;
        }

        const paragraphLines: string[] = [];
        while (i < lines.length) {
            const nextLine = lines[i];
            const nextTrimmed = nextLine.trim();
            if (!nextTrimmed || isHeading(nextLine) || isUnordered(nextLine) || isOrdered(nextLine) || nextTrimmed.startsWith('```')) {
                break;
            }
            paragraphLines.push(nextLine);
            i += 1;
        }
        const paragraph = formatInlineMarkdown(paragraphLines.join('\n')).replace(/\n/g, '<br />');
        blocks.push(`<p>${paragraph}</p>`);
    }

    if (inCodeBlock) {
        const code = escapeHtml(codeLines.join('\n'));
        blocks.push(`<pre><code>${code}</code></pre>`);
    }

    return blocks.join('\n');
}

export function htmlToMarkdown(html: string) {
    if (typeof document === 'undefined') return html;
    const temp = document.createElement('div');
    temp.innerHTML = html;

    const renderInline = (node: Node): string => {
        if (node.nodeType === Node.TEXT_NODE) return node.textContent || '';
        if (!(node instanceof HTMLElement)) return '';

        const content = Array.from(node.childNodes).map(renderInline).join('');
        const tag = node.tagName.toLowerCase();
        if (tag === 'strong' || tag === 'b') return `**${content}**`;
        if (tag === 'em' || tag === 'i') return `*${content}*`;
        if (tag === 'code') return `\`${content}\``;
        if (tag === 'a') return `[${content}](${node.getAttribute('href') || '#'})`;
        if (tag === 'br') return '\n';
        return content;
    };

    const renderBlock = (node: Element): string => {
        const tag = node.tagName.toLowerCase();
        if (/^h[1-6]$/.test(tag)) {
            const level = Number(tag.slice(1));
            return `${'#'.repeat(level)} ${renderInline(node).trim()}`;
        }
        if (tag === 'ul') {
            return Array.from(node.children).filter((child) => child.tagName.toLowerCase() === 'li').map((child) => `- ${renderInline(child).trim()}`).join('\n');
        }
        if (tag === 'ol') {
            return Array.from(node.children).filter((child) => child.tagName.toLowerCase() === 'li').map((child, index) => `${index + 1}. ${renderInline(child).trim()}`).join('\n');
        }
        if (tag === 'blockquote') {
            return renderMarkdownFromChildren(node).split('\n').map((line) => `> ${line}`).join('\n');
        }
        if (tag === 'pre') {
            return `\`\`\`\n${node.textContent || ''}\n\`\`\``;
        }
        if (tag === 'table') {
            const rows = Array.from(node.querySelectorAll('tr')).map((row) => Array.from(row.children).map((cell) => renderInline(cell).trim()));
            if (!rows.length) return '';
            const header = rows[0];
            const separator = header.map(() => '---');
            return [header, separator, ...rows.slice(1)].map((row) => `| ${row.join(' | ')} |`).join('\n');
        }
        if (tag === 'hr') return '---';
        return renderInline(node).trim();
    };

    const renderMarkdownFromChildren = (root: Element) => Array.from(root.children)
        .map(renderBlock)
        .filter(Boolean)
        .join('\n\n');

    const markdown = renderMarkdownFromChildren(temp);
    return (markdown || temp.textContent || '').replace(/\n{3,}/g, '\n\n').trim();
}

export const htmlToText = htmlToMarkdown;
