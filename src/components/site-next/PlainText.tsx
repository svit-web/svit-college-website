import { Fragment } from "react";

// Admin-entered descriptions are plain text. Render them literally (React
// escapes everything), keep blank-line-separated paragraphs and single line
// breaks, and turn bare http(s) URLs into links. No markdown, no HTML.

const URL_PATTERN = /https?:\/\/[^\s<>"']+/g;
// Punctuation that usually ends a sentence rather than belonging to the URL.
const TRAILING_PUNCTUATION = /[.,;:!?)\]}'"]+$/;

type Segment = string | { href: string; text: string };

export function linkifyPlainText(text: string): Segment[] {
  const segments: Segment[] = [];
  let last = 0;
  for (const match of text.matchAll(URL_PATTERN)) {
    const start = match.index ?? 0;
    let url = match[0];
    const trailing = url.match(TRAILING_PUNCTUATION)?.[0] ?? "";
    // Keep a closing paren when the URL itself contains an opening one.
    if (trailing && !(trailing.startsWith(")") && url.includes("("))) {
      url = url.slice(0, -trailing.length);
    }
    if (!url.match(/^https?:\/\/.+/)) continue;
    if (start > last) segments.push(text.slice(last, start));
    segments.push({ href: url, text: url });
    last = start + url.length;
  }
  if (last < text.length) segments.push(text.slice(last));
  return segments;
}

function Linkified({ text }: { text: string }) {
  const lines = text.split("\n");
  return (
    <>
      {lines.map((line, li) => (
        <Fragment key={li}>
          {li > 0 && <br />}
          {linkifyPlainText(line).map((seg, si) =>
            typeof seg === "string" ? (
              <Fragment key={si}>{seg}</Fragment>
            ) : (
              <a
                key={si}
                href={seg.href}
                target="_blank"
                rel="noreferrer"
                className="break-words font-medium text-navy underline decoration-gold decoration-2 underline-offset-2 hover:text-crimson"
              >
                {seg.text}
              </a>
            ),
          )}
        </Fragment>
      ))}
    </>
  );
}

export function PlainText({
  text,
  className,
}: {
  text: string | null | undefined;
  className?: string;
}) {
  const paragraphs = (text ?? "")
    .replace(/\r\n?/g, "\n")
    .split(/\n\s*\n/)
    .map((p) => p.trim())
    .filter(Boolean);
  if (!paragraphs.length) return null;

  return (
    <div className={className ?? "space-y-4 leading-relaxed text-muted-foreground"}>
      {paragraphs.map((p, i) => (
        <p key={i}>
          <Linkified text={p} />
        </p>
      ))}
    </div>
  );
}
