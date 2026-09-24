"use client";

import { useEffect, useRef, useState, type CSSProperties, type ReactNode } from "react";
import Link from "next/link";
import * as Dialog from "@radix-ui/react-dialog";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { ArrowRight, GraduationCap, Minus } from "lucide-react";
import {
  FOCUS_POSITION,
  SHAPE_ASPECT,
  isExternalHref,
  isHomePopupLive,
  type HomePopup as HomePopupData,
  type HomePopupLink,
  type HomePopupShape,
} from "@/lib/home-popup";

// Per browser session ("first visit" = once per session), so closing the tab
// brings the full popup back next time.
const SEEN_KEY = "svit-home-popup-seen";
// Pulse on the minimized pill stops once it has been clicked, across sessions.
const PILL_CLICKED_KEY = "svit-home-popup-pill-clicked";
const OPEN_DELAY_MS = 2000;

type Variant = "desktop" | "phone";

function readStorage(storage: "session" | "local", key: string): string | null {
  try {
    return (storage === "session" ? sessionStorage : localStorage).getItem(key);
  } catch {
    return null;
  }
}
function writeStorage(storage: "session" | "local", key: string, value: string) {
  try {
    (storage === "session" ? sessionStorage : localStorage).setItem(key, value);
  } catch {
    // Private mode / blocked storage: the popup still works, it just may reopen.
  }
}

function track(event: string, params: Record<string, string> = {}) {
  const gtag = (window as unknown as { gtag?: (...args: unknown[]) => void }).gtag;
  gtag?.("event", event, { popup: "home_popup", ...params });
}

function usePhoneLayout() {
  const [phone, setPhone] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia("(max-width: 639px)");
    const update = () => setPhone(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);
  return phone;
}

/**
 * Homepage popup banner (admissions by default), edited by global admins in
 * Admin → Homepage → Popup. Opens ~2s after load once per browser session,
 * then lives as a pill in the bottom-right corner that reopens it. There is
 * deliberately no way to dismiss the pill entirely.
 *
 * No blur anywhere (backdrop-filter / filter: blur): over the constantly
 * animating hero they force a full repaint every frame and made the page lag.
 */
export function HomePopup({ popup }: { popup: HomePopupData }) {
  const [state, setState] = useState<"idle" | "open" | "minimized">("idle");
  const [pulse, setPulse] = useState(false);
  const pillRef = useRef<HTMLButtonElement>(null);
  const phone = usePhoneLayout();
  const reduceMotion = useReducedMotion() ?? false;

  useEffect(() => {
    // Date window is checked here, not on the server: the homepage is cached.
    if (!isHomePopupLive(popup)) return;
    setPulse(readStorage("local", PILL_CLICKED_KEY) !== "1");
    if (readStorage("session", SEEN_KEY) === "1") {
      setState("minimized");
      return;
    }
    const t = window.setTimeout(() => {
      writeStorage("session", SEEN_KEY, "1");
      setState("open");
      track("popup_shown", { trigger: "auto" });
    }, OPEN_DELAY_MS);
    return () => window.clearTimeout(t);
  }, [popup]);

  if (state === "idle") return null;

  const open = state === "open";

  function minimize() {
    setState("minimized");
    track("popup_minimized");
  }

  function reopen() {
    setState("open");
    if (pulse) {
      setPulse(false);
      writeStorage("local", PILL_CLICKED_KEY, "1");
    }
    track("popup_reopened");
  }

  const motionProps = reduceMotion
    ? { initial: { opacity: 0 }, animate: { opacity: 1 }, exit: { opacity: 0 } }
    : {
        initial: { opacity: 0, scale: 0.94, y: 12 },
        animate: { opacity: 1, scale: 1, x: 0, y: 0 },
        // Shrinks towards the pill so visitors see where it went.
        exit: { opacity: 0, scale: 0.3, x: "35vw", y: "38vh" },
      };

  return (
    <>
      <Dialog.Root open={open} onOpenChange={(next) => !next && minimize()}>
        <AnimatePresence>
          {open && (
            <Dialog.Portal forceMount>
              <Dialog.Overlay asChild forceMount>
                <motion.div
                  data-lenis-prevent
                  className="fixed inset-0 z-[70] bg-ink/40"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.2 }}
                />
              </Dialog.Overlay>
              <Dialog.Content
                forceMount
                data-lenis-prevent
                aria-describedby={undefined}
                onCloseAutoFocus={(e) => {
                  e.preventDefault();
                  pillRef.current?.focus({ preventScroll: true });
                }}
                className="fixed inset-0 z-[71] outline-none"
              >
                <PopupStage variant={phone ? "phone" : "desktop"} onBackdropClick={minimize}>
                  <motion.div
                    className="flex max-h-full min-h-0 max-w-full"
                    {...motionProps}
                    transition={
                      reduceMotion
                        ? { duration: 0.2 }
                        : { type: "spring", bounce: 0.1, duration: 0.4 }
                    }
                  >
                    <HomePopupCard
                      popup={popup}
                      variant={phone ? "phone" : "desktop"}
                      onMinimize={minimize}
                      onLinkClick={(label) => track("popup_cta_click", { label })}
                      renderTitle={(node) => <Dialog.Title asChild>{node}</Dialog.Title>}
                    />
                  </motion.div>
                </PopupStage>
              </Dialog.Content>
            </Dialog.Portal>
          )}
        </AnimatePresence>
      </Dialog.Root>

      <HomePopupPill
        ref={pillRef}
        label={popup.minimized_label}
        pulse={pulse}
        hidden={open}
        onClick={reopen}
        position="fixed"
      />
    </>
  );
}

// ─── Stage + fit rules ───────────────────────────────────────────────────────

// The popup never scrolls. The stage is a size container named `home-popup`;
// when the screen is short, the image goes first and then the text is clamped.
// Plain CSS because Tailwind's container variants only query width.
const FIT_CSS = `
.hp-stage { container: home-popup / size; }
@container home-popup (max-height: 540px) { .hp-media-optional { display: none; } }
@container home-popup (max-height: 420px) {
  .hp-body { display: -webkit-box; -webkit-box-orient: vertical; -webkit-line-clamp: 3; overflow: hidden; }
  .hp-title { font-size: 1.5rem; }
}
@container home-popup (max-height: 320px) { .hp-body { -webkit-line-clamp: 2; } .hp-eyebrow { display: none; } }
`;

/**
 * Full-size area the card is centered in — the viewport on the site, the
 * scaled device frame in the admin preview. Also the container the card's
 * cqw/cqh sizes and fit rules measure against.
 */
export function PopupStage({
  variant,
  children,
  onBackdropClick,
  className = "fixed inset-0",
}: {
  variant: Variant;
  children: ReactNode;
  /** Radix forces pointer-events:auto on the dialog layer, so a click on the
   *  empty area around the card is caught here as "outside". */
  onBackdropClick?: () => void;
  className?: string;
}) {
  return (
    <div
      className={`hp-stage flex items-center justify-center ${variant === "phone" ? "p-4" : "p-8"} ${className}`}
      onClick={(e) => e.target === e.currentTarget && onBackdropClick?.()}
    >
      <style>{FIT_CSS}</style>
      {children}
    </div>
  );
}

// ─── Pill ────────────────────────────────────────────────────────────────────

export function HomePopupPill({
  ref,
  label,
  pulse,
  hidden,
  onClick,
  position,
}: {
  ref?: React.Ref<HTMLButtonElement>;
  label: string;
  pulse: boolean;
  hidden?: boolean;
  onClick?: () => void;
  /** "absolute" is for the admin preview frame. */
  position: "fixed" | "absolute";
}) {
  return (
    <button
      ref={ref}
      type="button"
      onClick={onClick}
      aria-label={`Open: ${label}`}
      aria-hidden={hidden || undefined}
      tabIndex={hidden ? -1 : 0}
      className={`${position} right-4 bottom-[max(1rem,env(safe-area-inset-bottom))] z-[55] flex items-center gap-2.5 rounded-full border border-ink bg-ink py-1.5 pr-4 pl-1.5 text-left text-cream shadow-[0_10px_28px_-10px_rgba(29,31,43,0.55)] transition-[opacity,transform,background-color,border-color] duration-200 hover:border-crimson hover:bg-crimson active:scale-95 max-[379px]:pr-1.5 ${hidden ? "pointer-events-none translate-y-2 opacity-0" : "opacity-100"}`}
    >
      <span className="relative flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-cream text-ink">
        <GraduationCap className="h-[18px] w-[18px]" aria-hidden />
        {pulse && (
          <span className="absolute -top-0.5 -right-0.5 flex h-3 w-3" aria-hidden>
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-crimson opacity-75 motion-reduce:animate-none" />
            <span className="relative inline-flex h-3 w-3 rounded-full border-2 border-ink bg-crimson" />
          </span>
        )}
      </span>
      <span className="max-w-[11rem] truncate text-[0.84rem] font-semibold max-[379px]:hidden">
        {label}
      </span>
    </button>
  );
}

// ─── Card ────────────────────────────────────────────────────────────────────

const SHAPE_RATIO: Record<Exclude<HomePopupShape, "original">, number> = {
  portrait: 4 / 5,
  square: 1,
  landscape: 16 / 9,
};
const POSTER_MAX_W: Record<HomePopupShape, number> = {
  portrait: 480,
  square: 560,
  landscape: 860,
  original: 860,
};

function PopupLink({
  link,
  kind,
  onClick,
}: {
  link: HomePopupLink;
  kind: "primary" | "secondary";
  onClick?: (label: string) => void;
}) {
  if (!link.label.trim() || !link.href.trim()) return null;
  // Same pills as the homepage hero.
  const className =
    kind === "primary"
      ? "group inline-flex items-center justify-center gap-[0.55rem] whitespace-nowrap rounded-full border border-ink bg-ink px-[1.25rem] py-[0.62rem] text-[0.84rem] font-semibold text-cream transition-colors hover:border-crimson hover:bg-crimson"
      : "group inline-flex items-center justify-center gap-[0.55rem] whitespace-nowrap rounded-full border border-line-strong px-[1.25rem] py-[0.62rem] text-[0.84rem] font-semibold text-ink transition-colors hover:border-ink hover:bg-ink hover:text-cream";
  const content = (
    <>
      <span>{link.label}</span>
      <ArrowRight
        className="h-[14px] w-[14px] shrink-0 transition-transform group-hover:translate-x-[3px]"
        aria-hidden
      />
    </>
  );
  const handle = () => onClick?.(link.label);
  return isExternalHref(link.href) ? (
    <a
      href={link.href}
      target="_blank"
      rel="noopener noreferrer"
      className={className}
      onClick={handle}
    >
      {content}
    </a>
  ) : (
    <Link href={link.href} className={className} onClick={handle}>
      {content}
    </Link>
  );
}

function PopupImg({
  popup,
  className = "",
  style,
}: {
  popup: HomePopupData;
  className?: string;
  style?: CSSProperties;
}) {
  if (!popup.image_url) return null;
  return (
    // eslint-disable-next-line @next/next/no-img-element -- admin-uploaded URL of unknown size; next/image needs fixed dims
    <img
      src={popup.image_url}
      alt={popup.image_alt}
      className={`block ${className}`}
      style={{ objectPosition: FOCUS_POSITION[popup.image_focus], ...style }}
    />
  );
}

function LinkOrDiv({
  href,
  onClick,
  className,
  children,
}: {
  href: string;
  onClick?: () => void;
  className?: string;
  children: ReactNode;
}) {
  const h = href.trim();
  if (!h) return <div className={className}>{children}</div>;
  return isExternalHref(h) ? (
    <a href={h} target="_blank" rel="noopener noreferrer" onClick={onClick} className={className}>
      {children}
    </a>
  ) : (
    <Link href={h} onClick={onClick} className={className}>
      {children}
    </Link>
  );
}

/**
 * The popup's visible card, in the homepage hero's language: cream card, crimson
 * spaced-caps label, bold ink title with an italic serif accent, ink pills.
 * Sized against the surrounding PopupStage (cqw/cqh) so the same markup fits
 * the real viewport and the admin preview frame, and never scrolls.
 */
export function HomePopupCard({
  popup,
  variant,
  onMinimize,
  onLinkClick,
  renderTitle = (node) => node,
}: {
  popup: HomePopupData;
  variant: Variant;
  onMinimize?: () => void;
  onLinkClick?: (label: string) => void;
  renderTitle?: (node: ReactNode) => ReactNode;
}) {
  const phone = variant === "phone";
  const shell =
    "relative flex min-h-0 max-h-full flex-col overflow-hidden rounded-[1.25rem] border border-line bg-cream text-ink shadow-[0_30px_80px_-24px_rgba(29,31,43,0.5)]";

  const minimizeButton = onMinimize && (
    <button
      type="button"
      onClick={onMinimize}
      aria-label="Minimize"
      className="absolute top-3 right-3 z-20 flex h-9 w-9 items-center justify-center rounded-full border border-line-strong bg-cream text-ink transition-colors hover:border-ink hover:bg-ink hover:text-cream"
    >
      <Minus className="h-4 w-4" aria-hidden />
    </button>
  );
  const hasPrimary = Boolean(popup.primary.label.trim() && popup.primary.href.trim());
  const hasSecondary = Boolean(popup.secondary.label.trim() && popup.secondary.href.trim());
  const buttons = (hasPrimary || hasSecondary) && (
    <div className={`flex flex-wrap gap-[0.7rem] ${phone ? "[&>*]:flex-1" : ""}`}>
      <PopupLink link={popup.primary} kind="primary" onClick={onLinkClick} />
      <PopupLink link={popup.secondary} kind="secondary" onClick={onLinkClick} />
    </div>
  );

  // ── Poster mode ──
  if (popup.mode === "poster") {
    const ratio = popup.image_shape === "original" ? null : SHAPE_RATIO[popup.image_shape];
    // Room the poster may take: the stage minus card padding and the button row.
    const pad = phone ? 12 : 16;
    const reserved = pad * 2 + (buttons ? (phone ? 64 : 68) : 0);
    const maxH = `calc(100cqh - ${reserved}px)`;
    const width = ratio
      ? `min(100cqw, calc(${maxH} * ${ratio} + ${pad * 2}px), ${POSTER_MAX_W[popup.image_shape] + pad * 2}px)`
      : `min(100cqw, ${POSTER_MAX_W.original + pad * 2}px)`;
    return (
      <div className={shell} style={{ width, padding: pad }}>
        {renderTitle(<h2 className="sr-only">{popup.image_alt || popup.minimized_label}</h2>)}
        {minimizeButton}
        <LinkOrDiv
          href={popup.poster_href}
          onClick={() => onLinkClick?.("poster")}
          className="block min-h-0 overflow-hidden rounded-xl border border-line bg-paper"
        >
          <PopupImg
            popup={popup}
            className={
              ratio ? "w-full object-cover" : "mx-auto h-auto w-auto max-w-full object-contain"
            }
            style={
              ratio
                ? { aspectRatio: SHAPE_ASPECT[popup.image_shape as keyof typeof SHAPE_ASPECT] }
                : { maxHeight: maxH }
            }
          />
        </LinkOrDiv>
        {buttons && (
          <div className={`shrink-0 ${phone ? "pt-3" : "flex justify-center pt-4"}`}>{buttons}</div>
        )}
      </div>
    );
  }

  // ── Text mode ──
  const sideImage =
    !phone &&
    popup.image_url &&
    (popup.image_shape === "portrait" || popup.image_shape === "square");
  const topImage = Boolean(popup.image_url) && !sideImage;
  const topAspect =
    phone || popup.image_shape === "original"
      ? "16 / 9"
      : SHAPE_ASPECT[popup.image_shape as keyof typeof SHAPE_ASPECT];

  const text = (
    <div className={`flex min-h-0 flex-col ${phone ? "p-5 pt-6" : "p-8 pr-14 md:p-10 md:pr-16"}`}>
      {popup.eyebrow.trim() && (
        <p className="hp-eyebrow text-[0.7rem] font-bold tracking-[0.22em] text-crimson uppercase">
          {popup.eyebrow}
        </p>
      )}
      {renderTitle(
        <h2
          className={`hp-title mt-[0.9rem] leading-[1.05] font-bold tracking-[-0.035em] text-ink ${phone ? "text-[1.7rem]" : "text-[clamp(1.9rem,3cqw,2.6rem)]"}`}
        >
          {popup.title}
          {popup.title_accent.trim() && (
            <>
              {" "}
              <em className="font-serif font-medium tracking-[-0.01em] italic">
                {popup.title_accent}
              </em>
            </>
          )}
        </h2>,
      )}
      {popup.body.trim() && (
        <p
          className={`hp-body mt-3 leading-[1.55] font-medium text-ink-soft ${phone ? "text-[0.95rem]" : "text-base"}`}
        >
          {popup.body}
        </p>
      )}
      {buttons && <div className={phone ? "mt-5" : "mt-6"}>{buttons}</div>}
    </div>
  );

  return (
    <div
      className={shell}
      style={{ width: phone ? "100cqw" : sideImage ? "min(100cqw, 800px)" : "min(100cqw, 560px)" }}
    >
      {minimizeButton}
      {sideImage ? (
        <div className="grid min-h-0 grid-cols-[2fr_3fr]">
          {/* Fills whatever height the text needs; never sets the card's height. */}
          <div className="hp-media-optional relative border-r border-line">
            <PopupImg popup={popup} className="absolute inset-0 h-full w-full object-cover" />
          </div>
          {text}
        </div>
      ) : (
        <>
          {topImage && (
            // Shrinks before the text does (min-h-0 + flex-shrink), and drops out on short screens.
            <div
              className={`hp-media-optional relative min-h-0 shrink ${phone ? "mx-3 mt-3 overflow-hidden rounded-xl border border-line" : "border-b border-line"}`}
              style={{ aspectRatio: topAspect, minHeight: 96 }}
            >
              <PopupImg popup={popup} className="absolute inset-0 h-full w-full object-cover" />
            </div>
          )}
          <div className="shrink-0">{text}</div>
        </>
      )}
    </div>
  );
}
