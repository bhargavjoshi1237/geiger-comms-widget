// 2d — Article reader.
//
// Category eyebrow, title, byline, body blocks and a "did this answer your
// question?" footer that offers the AI as the next step.

import { ArrowUpRight, Clock, ThumbsUp } from "../icons";
import { HeaderBar } from "../primitives";
import type { Article } from "../model";

export function ArticleView({
  article,
  onBack,
  onAskInstead,
  onRate,
  onOpenExternal,
}: {
  article: Article;
  onBack: () => void;
  onAskInstead: () => void;
  onRate: (helpful: boolean) => void;
  onOpenExternal?: () => void;
}) {
  return (
    <>
      <HeaderBar
        onBack={onBack}
        action={
          <button
            type="button"
            className="gc-iconbtn gc-iconbtn--sm"
            onClick={onOpenExternal}
            aria-label="Open in help centre"
          >
            <ArrowUpRight />
          </button>
        }
      >
        <span className="gc-header__eyebrow">{article.category.toUpperCase()}</span>
      </HeaderBar>

      <article className="gc-article">
        <h2>{article.title}</h2>
        {article.author ? (
          <div className="gc-article__byline">
            <div className="gc-avatar gc-avatar--xs" aria-hidden="true">
              {article.author.initials}
            </div>
            <span>
              {article.author.name.toUpperCase()}
              {article.updated ? ` · UPDATED ${article.updated.toUpperCase()}` : ""}
            </span>
          </div>
        ) : null}
        <div className="gc-article__divider" />

        {article.blocks.map((block, i) => {
          switch (block.type) {
            case "lead":
              return (
                <p key={i} className="gc-article__lead">
                  {block.text}
                </p>
              );
            case "heading":
              return (
                <p key={i} className="gc-article__h3">
                  {block.text}
                </p>
              );
            case "paragraph":
              return (
                <p key={i} className="gc-article__p">
                  {block.text}
                </p>
              );
            case "callout":
              return (
                <aside key={i} className="gc-callout">
                  <Clock />
                  <p>{block.text}</p>
                </aside>
              );
          }
        })}
      </article>

      <footer className="gc-panel__footer gc-articlefoot">
        <div className="gc-articlefoot__row">
          <span className="gc-articlefoot__label">Did this answer your question?</span>
          <div className="gc-articlefoot__thumbs">
            <button type="button" className="gc-thumb gc-thumb--up" onClick={() => onRate(true)} aria-label="Yes">
              <ThumbsUp size={13} />
            </button>
            <button type="button" className="gc-thumb gc-thumb--down" onClick={() => onRate(false)} aria-label="No">
              <ThumbsUp size={13} />
            </button>
          </div>
        </div>
        <button type="button" className="gc-outlinebtn" onClick={onAskInstead}>
          Ask about my order instead
        </button>
      </footer>
    </>
  );
}
