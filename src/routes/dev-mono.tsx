import { createFileRoute } from "@tanstack/react-router";
import { RoyalMonogram } from "@/components/public/opening/RoyalMonogram";
import "@/components/public/opening/opening.css";

export const Route = createFileRoute("/dev-mono")({
  component: () => (
    <div style={{ background: "#3d5540", minHeight: "100vh", display: "grid", placeItems: "center" }}>
      <RoyalMonogram first="Pauline" second="Romain" className="royal-monogram" />
    </div>
  ),
});
