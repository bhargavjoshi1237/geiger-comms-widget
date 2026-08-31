// 2c — Help centre search.
//
// Live-filtered article list with the matched term highlighted, an "ask Aria
// instead" nudge above the results, and a "can't find it?" escape hatch.

import { useMemo, useState } from "react";
import { ChevronRight, FileText, Search, Sparkles, X } from "../icons";
import { Cap } from "../primitives";
import type { Article } from "../model";

/** Wraps every case-insensitive hit of `term` in a <mark>. */
function highlight(text: string, term: string) {
  const q = term.trim();
  if (!q) return text;
  const parts: (string | { hit: string })[] = [];
  const lower = text.toLowerCase();
  const needle = q.toLowerCase();
  let from = 0;
  for (;;) {
    const at = lower.indexOf(needle, from);
    if (at === -1) break;
    if (at > from) parts.push(text.slice(from, at));
    parts.push({ hit: text.slice(at, at + needle.length) });
    from = at + needle.length;
  }
  if (from < text.length) parts.push(text.slice(from));
  return parts.map((p, i) =>
    typeof p === "string" ? <span key={i}>{p}</span> : <mark key={i}>{p.hit}</mark>,
  );
}

export function HelpView({
  articles,
  assistantName,
  initialQuery = "",
  onOpenArticle,
  onAsk,
  onMessageTeam,
  onClose,
}: {
  articles: Article[];
  assistantName: string;
  initialQuery?: string;
  onOpenArticle: (id: string) => void;
  onAsk: () => void;
  onMessageTeam: () => void;
  onClose: () => void;
}) {
  const [query, setQuery] = useState(initialQuery);

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return articles;
    return articles.filter(
      (a) =>
        a.title.toLowerCase().includes(q) ||
        a.excerpt.toLowerCase().includes(q) ||
        a.category.toLowerCase().includes(q),
    );
  }, [articles, query]);

  return (
    <>
      <header className="gc-helphead">
        <div className="gc-helphead__row">
          <span className="gc-listhead__title">Help centre</span>
          <button type="button" className="gc-iconbtn gc-iconbtn--sm" onClick={onClose} aria-label="Close messenger">
            <X />
          </button>
        </div>
        <div className="gc-search" style={{ marginTop: 0 }}>
          <Search className="gc-search__icon" />
          <input
            type="search"
            className="gc-search__input"
            value={query}
            placeholder="Search for help"
            aria-label="Search the help centre"
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>
      </header>

      <div className="gc-panel__body" style={{ padding: "12px 0" }}>
        <button type="button" className="gc-suggest" onClick={onAsk}>
          <Sparkles size={15} className="gc-suggest__icon" />
          <div className="gc-suggest__body">
            <p className="gc-suggest__title">Ask {assistantName} instead</p>
            <p className="gc-suggest__desc">
              She&rsquo;ll check your actual order rather than the general article.
            </p>
          </div>
          <ChevronRight size={14} style={{ color: "var(--gc-text-tertiary)", flex: "none", marginTop: 3 }} />
        </button>

        <div style={{ padding: "0 14px 6px" }}>
          <Cap>
            {results.length} {results.length === 1 ? "article" : "articles"}
          </Cap>
        </div>

        {results.map((a) => (
          <button key={a.id} type="button" className="gc-article-row" onClick={() => onOpenArticle(a.id)}>
            <FileText size={14} className="gc-article-row__icon" />
            <span style={{ minWidth: 0 }}>
              <span className="gc-article-row__title">{highlight(a.title, query)}</span>
              <span className="gc-article-row__desc">{a.excerpt}</span>
              <span className="gc-article-row__meta">
                {a.category.toUpperCase()} · {a.readingTime.toUpperCase()}
              </span>
            </span>
          </button>
        ))}
      </div>

      <div className="gc-panel__footer gc-helpfoot">
        <span className="gc-helpfoot__text">Can&rsquo;t find it?</span>
        <button type="button" className="gc-primarybtn" onClick={onMessageTeam}>
          Message the team
        </button>
      </div>
    </>
  );
}
