import { useEffect, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { toast } from "sonner";
import { submitGuestbookMessage } from "@/lib/guestbook.functions";

interface Props {
  weddingId: string;
  brideName: string;
  groomName: string;
}

const PETALS = [
  { left: "15%", delay: "0s", color: "#ED93B1" },
  { left: "75%", delay: "0.4s", color: "#C8973A" },
  { left: "45%", delay: "0.8s", color: "#ED93B1" },
  { left: "88%", delay: "0.2s", color: "#C8973A" },
];

function BookHeartIcon({ color = "#FAF8F5", size = 24 }: { color?: string; size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke={color}
      strokeWidth={1.6}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M4 4.5A1.5 1.5 0 0 1 5.5 3H19a1 1 0 0 1 1 1v14a1 1 0 0 1-1 1H5.5A1.5 1.5 0 0 0 4 20.5z" />
      <path d="M12 3v16" />
      <path d="M6.5 7h3.2M6.5 10h3.2" />
      <path d="M14.3 7h3.2" />
      <path d="M16 14.6c-1.6-1-2.1-1.9-1.6-2.7.4-.7 1.3-.7 1.6-.1.3-.6 1.2-.6 1.6.1.5.8 0 1.7-1.6 2.7z" />
    </svg>
  );
}

export function GuestbookFab({ weddingId, brideName, groomName }: Props) {
  const submitFn = useServerFn(submitGuestbookMessage);
  const [isOpen, setIsOpen] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [sending, setSending] = useState(false);
  const [name, setName] = useState("");
  const [message, setMessage] = useState("");
  const [showRipple, setShowRipple] = useState(true);
  const [showTooltip, setShowTooltip] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (!sessionStorage.getItem("guestbook_tooltip_seen")) setShowTooltip(true);
  }, []);

  useEffect(() => {
    const t = setTimeout(() => setShowRipple(false), 6000);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    if (!showTooltip) return;
    const t = setTimeout(() => {
      setShowTooltip(false);
      try {
        sessionStorage.setItem("guestbook_tooltip_seen", "true");
      } catch {
        /* noop */
      }
    }, 4000);
    return () => clearTimeout(t);
  }, [showTooltip]);

  const handleClose = () => {
    setIsOpen(false);
    setTimeout(() => {
      setSubmitted(false);
      setName("");
      setMessage("");
    }, 400);
  };

  const handleSubmit = async () => {
    const authorName = name.trim();
    const body = message.trim();
    if (!authorName || !body || sending) return;
    setSending(true);
    try {
      await submitFn({ data: { weddingId, authorName, message: body } });
      setSubmitted(true);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Envoi impossible.");
    } finally {
      setSending(false);
    }
  };

  const canSend = !!name.trim() && !!message.trim() && !sending;
  const firstName = name.trim().split(" ")[0] || name.trim();

  return (
    <>
      <div className="guestbook-fab-wrap">
        {showTooltip && !isOpen ? (
          <div className="guestbook-tooltip">
            Laissez un message ✨
            <span className="guestbook-tooltip-arrow" />
          </div>
        ) : null}

        {showRipple && !isOpen ? (
          <>
            <span className="guestbook-ripple" />
            <span className="guestbook-ripple" style={{ animationDelay: "1s" }} />
          </>
        ) : null}

        <button
          type="button"
          className="guestbook-fab"
          onClick={() => setIsOpen(true)}
          aria-label="Livre d'or — Laisser un message"
        >
          <BookHeartIcon />
        </button>
      </div>

      {isOpen ? (
        <div
          className="guestbook-overlay"
          onClick={(e) => {
            if (e.target === e.currentTarget) handleClose();
          }}
        >
          <div className="guestbook-sheet">
            {PETALS.map((p, i) => (
              <span
                key={i}
                className="petal"
                style={{ left: p.left, animationDelay: p.delay, background: p.color }}
              />
            ))}
            <div className="sheet-handle" />

            {!submitted ? (
              <div style={{ padding: "20px 20px 12px" }}>
                <div style={{ textAlign: "center", marginBottom: 18 }}>
                  <div className="sheet-icon">
                    <BookHeartIcon color="#C8973A" size={26} />
                  </div>
                  <p className="sheet-title">Livre d'or</p>
                  <p className="sheet-subtitle">
                    Laissez un message à{" "}
                    <strong>
                      {brideName} &amp; {groomName}
                    </strong>
                  </p>
                </div>

                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Votre nom"
                  maxLength={80}
                  className="sheet-input"
                />
                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Votre message pour les mariés…"
                  rows={4}
                  maxLength={600}
                  className="sheet-textarea"
                />
                <p className="sheet-counter">{message.length}/600</p>

                <button
                  type="button"
                  onClick={handleSubmit}
                  disabled={!canSend}
                  className={`sheet-submit ${canSend ? "active" : ""}`}
                >
                  {sending ? "Envoi…" : "Envoyer mon message"}
                </button>

                <p className="sheet-privacy">
                  🔒 Votre message sera lu uniquement par les mariés
                </p>
              </div>
            ) : (
              <div style={{ padding: "32px 20px 12px", textAlign: "center" }}>
                <div className="success-check">
                  <svg
                    width="30"
                    height="30"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="#059669"
                    strokeWidth={2.2}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    aria-hidden="true"
                  >
                    <path d="M20 6 9 17l-5-5" />
                  </svg>
                </div>
                <p className="success-title">Message envoyé !</p>
                <p className="success-sub">
                  Merci <strong>{firstName}</strong> 🌸
                  <br />
                  {brideName} &amp; {groomName} liront
                  <br />
                  votre message avec beaucoup d'émotion.
                </p>

                <div className="success-card">
                  <span className="success-card-name">{name}</span>
                  <p className="success-card-msg">{message}</p>
                </div>

                <button type="button" onClick={handleClose} className="success-close">
                  Fermer
                </button>
              </div>
            )}
          </div>
        </div>
      ) : null}
    </>
  );
}
