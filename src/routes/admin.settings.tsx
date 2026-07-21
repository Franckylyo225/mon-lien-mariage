import { createFileRoute } from "@tanstack/react-router";
import { IconTicket, IconInfoCircle, IconMail } from "@tabler/icons-react";

export const Route = createFileRoute("/admin/settings")({
  component: AdminSettings,
});

function AdminSettings() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-serif text-2xl">Paramètres</h1>
        <p className="text-sm text-muted-foreground">
          Configuration de la plateforme et informations générales.
        </p>
      </div>

      <section className="rounded-2xl border border-border/60 bg-white p-5 shadow-sm">
        <div className="mb-3 flex items-center gap-2">
          <span className="grid size-8 place-items-center rounded-full bg-amber-50 text-amber-700">
            <IconTicket size={16} />
          </span>
          <h2 className="font-serif text-lg">Codes promo</h2>
        </div>
        <div className="space-y-2 text-sm">
          <div className="flex items-center justify-between rounded-xl border border-dashed border-border/60 bg-neutral-50 px-4 py-3">
            <div>
              <p className="font-mono font-medium">TIANA100</p>
              <p className="text-[11px] text-muted-foreground">
                Publication instantanée à 100 % de réduction
              </p>
            </div>
            <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-[11px] text-emerald-700">
              Actif
            </span>
          </div>
          <p className="text-[11px] text-muted-foreground">
            La gestion multi-codes sera ajoutée dans une prochaine itération.
          </p>
        </div>
      </section>

      <section className="rounded-2xl border border-border/60 bg-white p-5 shadow-sm">
        <div className="mb-3 flex items-center gap-2">
          <span className="grid size-8 place-items-center rounded-full bg-blue-50 text-blue-700">
            <IconMail size={16} />
          </span>
          <h2 className="font-serif text-lg">Emails transactionnels</h2>
        </div>
        <ul className="space-y-1.5 text-sm">
          <li>
            <span className="text-muted-foreground">Domaine d'envoi :</span>{" "}
            <span className="font-mono">notify.moninvit.com</span>
          </li>
          <li>
            <span className="text-muted-foreground">Adresse de contact :</span>{" "}
            <span className="font-mono">contact@moninvit.com</span>
          </li>
          <li>
            <span className="text-muted-foreground">Statut file :</span>{" "}
            <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-[11px] text-emerald-700">
              Opérationnelle
            </span>
          </li>
        </ul>
      </section>

      <section className="rounded-2xl border border-border/60 bg-white p-5 shadow-sm">
        <div className="mb-3 flex items-center gap-2">
          <span className="grid size-8 place-items-center rounded-full bg-neutral-100 text-neutral-700">
            <IconInfoCircle size={16} />
          </span>
          <h2 className="font-serif text-lg">Tarification</h2>
        </div>
        <ul className="space-y-1.5 text-sm">
          <li>
            <span className="text-muted-foreground">Prix par publication :</span>{" "}
            <span className="font-mono">24 900 XOF</span>
          </li>
          <li>
            <span className="text-muted-foreground">Devise :</span>{" "}
            <span>Franc CFA (XOF)</span>
          </li>
          <li>
            <span className="text-muted-foreground">Paiement Paystack :</span>{" "}
            <span className="rounded-full bg-amber-50 px-2 py-0.5 text-[11px] text-amber-700">
              En attente d'activation
            </span>
          </li>
        </ul>
      </section>
    </div>
  );
}
