import type { CSSProperties } from "react";

export type StoryLayout = "left" | "center" | "cards";
export type StoryPhotoShape = "rounded" | "circle" | "square";

export interface StoryStep {
  id: string;
  year?: string | null;
  title?: string | null;
  text?: string | null;
  photoUrl?: string | null;
}

export const STORY_LAYOUTS: Array<{
  id: StoryLayout;
  label: string;
  description: string;
}> = [
  { id: "left", label: "Timeline gauche", description: "Ligne verticale à gauche" },
  { id: "center", label: "Alternée centrée", description: "Étapes en zigzag" },
  { id: "cards", label: "Cartes", description: "Cartes empilées compactes" },
];

export const STORY_PHOTO_SHAPES: Array<{
  id: StoryPhotoShape;
  label: string;
  description: string;
}> = [
  { id: "rounded", label: "Arrondi", description: "Rectangle pill (par défaut)" },
  { id: "circle", label: "Cercle", description: "Photo ronde" },
  { id: "square", label: "Carré", description: "Photo carrée" },
];

export function photoStyle(shape: StoryPhotoShape): CSSProperties {
  if (shape === "circle") {
    return { width: 84, height: 84, borderRadius: "50%", objectFit: "cover", flexShrink: 0 };
  }
  if (shape === "square") {
    return { width: 84, height: 84, borderRadius: 4, objectFit: "cover", flexShrink: 0 };
  }
  return { width: 72, height: 96, borderRadius: 999, objectFit: "cover", flexShrink: 0 };
}

function photoCenter(shape: StoryPhotoShape) {
  return shape === "rounded" ? 42 : 36;
}

export interface StoryTheme {
  accent: string;
  text: string;
  textSoft: string;
  gold?: string;
}

function StepPhoto({ step, shape }: { step: StoryStep; shape: StoryPhotoShape }) {
  if (!step.photoUrl) return null;
  return (
    <img
      src={step.photoUrl}
      alt={step.title ?? ""}
      loading="lazy"
      style={photoStyle(shape)}
      className="shadow-sm ring-1 ring-black/5"
    />
  );
}

export function StoryHeader({ title, theme }: { title?: string; theme: StoryTheme }) {
  const ornament = theme.gold || theme.accent;
  return (
    <div style={{ textAlign: "center", marginBottom: 28 }}>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 10,
          justifyContent: "center",
          marginBottom: 10,
        }}
      >
        <div style={{ height: 1, width: 28, background: ornament, opacity: 0.6 }} />
        <span style={{ color: ornament, fontSize: 12, opacity: 0.8 }}>✦</span>
        <div style={{ height: 1, width: 28, background: ornament, opacity: 0.6 }} />
      </div>
      <h2
        className="font-serif italic"
        style={{ fontSize: 26, color: theme.text, lineHeight: 1.2 }}
      >
        {title?.trim() || "Notre Histoire"}
      </h2>
    </div>
  );
}

export function TimelineLeft({
  steps,
  theme,
  photoShape,
}: {
  steps: StoryStep[];
  theme: StoryTheme;
  photoShape: StoryPhotoShape;
}) {
  return (
    <div style={{ position: "relative", paddingLeft: 20 }}>
      <div
        style={{
          position: "absolute",
          left: 0,
          top: 8,
          bottom: 8,
          width: 1.5,
          background: `linear-gradient(180deg, ${theme.accent}, ${(theme.gold || theme.accent) + "80"}, ${theme.accent})`,
        }}
      />
      {steps.map((step) => (
        <div
          key={step.id}
          style={{ display: "flex", gap: 14, marginBottom: 28, position: "relative" }}
        >
          <div
            style={{
              position: "absolute",
              left: -24,
              top: photoCenter(photoShape),
              width: 12,
              height: 12,
              borderRadius: "50%",
              background: theme.accent,
              border: "2px solid #fff",
              boxShadow: `0 0 0 2px ${theme.accent}`,
              flexShrink: 0,
            }}
          />
          <StepPhoto step={step} shape={photoShape} />
          <div style={{ flex: 1, paddingTop: 4 }}>
            {step.year && (
              <span
                className="font-sans"
                style={{
                  fontSize: 9,
                  fontWeight: 700,
                  color: "#fff",
                  background: theme.accent,
                  padding: "2px 8px",
                  borderRadius: 999,
                  display: "inline-block",
                  marginBottom: 5,
                }}
              >
                {step.year}
              </span>
            )}
            {step.title && (
              <p
                className="font-serif italic"
                style={{ fontSize: 17, color: theme.text, marginBottom: 4, lineHeight: 1.2 }}
              >
                {step.title}
              </p>
            )}
            {step.text && (
              <p
                className="whitespace-pre-line font-sans"
                style={{ fontSize: 12, color: theme.textSoft, lineHeight: 1.6 }}
              >
                {step.text}
              </p>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}

export function TimelineCenter({
  steps,
  theme,
  photoShape,
}: {
  steps: StoryStep[];
  theme: StoryTheme;
  photoShape: StoryPhotoShape;
}) {
  return (
    <div style={{ position: "relative" }}>
      <div
        style={{
          position: "absolute",
          left: "50%",
          top: 0,
          bottom: 0,
          width: 1,
          background: `linear-gradient(180deg, transparent, ${theme.accent}60 10%, ${theme.accent}60 90%, transparent)`,
          transform: "translateX(-50%)",
        }}
      />
      {steps.map((step, i) => {
        const isLeft = i % 2 === 0;
        return (
          <div
            key={step.id}
            style={{
              display: "flex",
              flexDirection: isLeft ? "row" : "row-reverse",
              alignItems: "center",
              marginBottom: 32,
            }}
          >
            <div
              style={{
                flex: 1,
                textAlign: isLeft ? "right" : "left",
                paddingRight: isLeft ? 20 : 0,
                paddingLeft: isLeft ? 0 : 20,
              }}
            >
              {step.year && (
                <p
                  className="font-sans"
                  style={{
                    fontSize: 9,
                    fontWeight: 700,
                    color: theme.accent,
                    letterSpacing: ".08em",
                    marginBottom: 3,
                  }}
                >
                  {step.year}
                </p>
              )}
              {step.title && (
                <p
                  className="font-serif italic"
                  style={{ fontSize: 16, color: theme.text, marginBottom: 4 }}
                >
                  {step.title}
                </p>
              )}
              {step.text && (
                <p
                  className="whitespace-pre-line font-sans"
                  style={{ fontSize: 11, color: theme.textSoft, lineHeight: 1.55 }}
                >
                  {step.text}
                </p>
              )}
            </div>

            <div
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: 6,
                flexShrink: 0,
                zIndex: 2,
              }}
            >
              <StepPhoto step={step} shape={photoShape} />
              <div
                style={{
                  width: 8,
                  height: 8,
                  borderRadius: "50%",
                  background: theme.accent,
                  boxShadow: `0 0 0 3px ${theme.accent}25`,
                }}
              />
            </div>

            <div style={{ flex: 1 }} />
          </div>
        );
      })}
    </div>
  );
}

export function TimelineCards({
  steps,
  theme,
  photoShape,
}: {
  steps: StoryStep[];
  theme: StoryTheme;
  photoShape: StoryPhotoShape;
}) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
      {steps.map((step) => (
        <div
          key={step.id}
          style={{
            display: "flex",
            background: "#fff",
            borderRadius: 14,
            overflow: "hidden",
            boxShadow: "0 2px 12px rgba(0,0,0,0.06)",
            border: "0.5px solid rgba(0,0,0,0.07)",
          }}
        >
          <div style={{ width: 4, background: theme.accent, flexShrink: 0 }} />
          <div
            style={{ display: "flex", alignItems: "center", gap: 12, padding: 14, flex: 1 }}
          >
            <StepPhoto step={step} shape={photoShape} />
            <div style={{ flex: 1 }}>
              {step.year && (
                <p
                  className="font-serif italic"
                  style={{ fontSize: 15, color: theme.accent, marginBottom: 2 }}
                >
                  {step.year}
                </p>
              )}
              {step.title && (
                <p
                  className="font-serif italic"
                  style={{ fontSize: 16, color: "#1c1917", marginBottom: 4 }}
                >
                  {step.title}
                </p>
              )}
              {step.text && (
                <p
                  className="whitespace-pre-line font-sans"
                  style={{ fontSize: 11, color: "rgba(28,25,23,0.65)", lineHeight: 1.5 }}
                >
                  {step.text}
                </p>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

export function StoryTimeline({
  steps,
  theme,
  layout,
  photoShape,
}: {
  steps: StoryStep[];
  theme: StoryTheme;
  layout: StoryLayout;
  photoShape: StoryPhotoShape;
}) {
  if (layout === "center") {
    return (
      <>
        <div className="hidden sm:block">
          <TimelineCenter steps={steps} theme={theme} photoShape={photoShape} />
        </div>
        <div className="sm:hidden">
          <TimelineLeft steps={steps} theme={theme} photoShape={photoShape} />
        </div>
      </>
    );
  }
  if (layout === "cards") {
    return <TimelineCards steps={steps} theme={theme} photoShape={photoShape} />;
  }
  return <TimelineLeft steps={steps} theme={theme} photoShape={photoShape} />;
}
