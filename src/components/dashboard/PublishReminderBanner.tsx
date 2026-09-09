import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { IconX } from "@tabler/icons-react";
import { daysUntil } from "@/lib/wedding-store";

type UrgencyLevel = "neutral" | "encouraging" | "urgent" | "critical";

function getUrgencyLevel(daysLeft: number): UrgencyLevel {
  if (daysLeft > 60) return "neutral";
  if (daysLeft > 30) return "encouraging";
  if (daysLeft > 14) return "urgent";
  return "critical";
}

interface PublishReminderBannerProps {
  weddingDate: string;
  brideFirstName: string;
  groomFirstName: string;
}

export function PublishReminderBanner({
  weddingDate,
  brideFirstName,
  groomFirstName,
}: PublishReminderBannerProps) {
  const [dismissed, setDismissed] = useState(false);

  const daysLeft = daysUntil(weddingDate);
  if (daysLeft === null || daysLeft < 0) return null;

  const level = getUrgencyLevel(daysLeft);

  const config = {
    neutral: {
      bg: "bg-[#F5F2F0]",
      text: "text-[#5A4F52]",
      sub: "text-[#5A4F52]/80",
      icon: "📅",
      message: `${daysLeft} jours avant votre mariage`,
      subText: "Publiez votre invitation dès que vous êtes prêt(e).",
      sticky: false,
      dismissible: true,
    },
    encouraging: {
      bg: "bg-[#FCE8EE]",
      text: "text-[#201A1C]",
      sub: "text-[#201A1C]/70",
      icon: "💌",
      message: `Plus que ${daysLeft} jours avant votre mariage`,
      subText:
        "Publiez votre invitation pour commencer à recevoir vos confirmations.",
      sticky: false,
      dismissible: true,
    },
    urgent: {
      bg: "bg-[#E82050]",
      text: "text-white",
      sub: "text-white/80",
      icon: "⏱",
      message: `Plus que ${daysLeft} jours avant votre mariage`,
      subText: `${brideFirstName} & ${groomFirstName}, vos invités attendent de vos nouvelles.`,
      sticky: false,
      dismissible: true,
    },
    critical: {
      bg: "bg-[#D33A3A]",
      text: "text-white",
      sub: "text-white/85",
      icon: "🚨",
      message: `Il ne reste que ${daysLeft} jours !`,
      subText: "Votre invitation doit être publiée dès maintenant.",
      sticky: true,
      dismissible: false,
    },
  }[level];

  if (dismissed && config.dismissible) return null;

  const lightBanner = level === "neutral" || level === "encouraging";

  return (
    <section
      className={`flex flex-col gap-3 rounded-xl px-4 py-3.5 sm:flex-row sm:items-center ${config.bg} ${
        config.sticky ? "sticky top-2 z-30 shadow-lg" : ""
      }`}
      role={level === "critical" ? "alert" : "status"}
    >
      <span className="text-xl leading-none" aria-hidden>
        {config.icon}
      </span>

      <div className="min-w-0 flex-1">
        <p className={`text-[13px] font-semibold ${config.text}`}>
          {config.message}
        </p>
        <p className={`text-[11px] ${config.sub}`}>{config.subText}</p>
      </div>

      <div className="flex w-full items-center justify-between gap-2 sm:w-auto sm:justify-end">
        <Link
          to="/publish"
          className={`whitespace-nowrap rounded-full px-4 py-2 text-[13px] font-bold transition active:scale-95 ${
            lightBanner
              ? "bg-[#E82050] text-white"
              : level === "critical"
                ? "bg-white text-[#D33A3A]"
                : "bg-white text-[#E82050]"
          }`}
        >
          Publier maintenant →
        </Link>

        {config.dismissible ? (
          <button
            type="button"
            onClick={() => setDismissed(true)}
            aria-label="Fermer"
            className={`shrink-0 opacity-60 transition hover:opacity-100 ${config.text}`}
          >
            <IconX size={16} strokeWidth={2} />
          </button>
        ) : null}
      </div>
    </section>
  );
}
