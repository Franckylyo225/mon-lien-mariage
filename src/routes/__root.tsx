import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  Link,
  createRootRouteWithContext,
  useRouter,
  HeadContent,
  Scripts,
} from "@tanstack/react-router";
import { useEffect, type ReactNode } from "react";

import appCss from "../styles.css?url";
import { reportLovableError } from "../lib/lovable-error-reporting";
import { WeddingProvider } from "../lib/wedding-store";

function NotFoundComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <p className="font-mono text-xs uppercase tracking-[0.3em] text-primary">404</p>
        <h1 className="mt-4 font-serif text-4xl italic text-foreground">Page introuvable</h1>
        <p className="mt-3 text-sm text-muted-foreground">
          Cette page n'existe pas ou a été déplacée.
        </p>
        <Link
          to="/"
          className="mt-8 inline-flex items-center justify-center rounded-full bg-primary px-6 py-3 text-xs font-medium uppercase tracking-widest text-primary-foreground transition hover:opacity-90"
        >
          Retour à l'accueil
        </Link>
      </div>
    </div>
  );
}

function ErrorComponent({ error, reset }: { error: Error; reset: () => void }) {
  console.error(error);
  const router = useRouter();
  useEffect(() => {
    reportLovableError(error, { boundary: "tanstack_root_error_component" });
  }, [error]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="font-serif text-2xl italic text-foreground">
          Un petit imprévu…
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Quelque chose n'a pas fonctionné. Réessayez ou revenez à l'accueil.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-2">
          <button
            onClick={() => {
              router.invalidate();
              reset();
            }}
            className="inline-flex items-center justify-center rounded-full bg-primary px-6 py-3 text-xs font-medium uppercase tracking-widest text-primary-foreground transition hover:opacity-90"
          >
            Réessayer
          </button>
          <a
            href="/"
            className="inline-flex items-center justify-center rounded-full border border-border bg-background px-6 py-3 text-xs font-medium uppercase tracking-widest text-foreground transition hover:bg-accent/20"
          >
            Accueil
          </a>
        </div>
      </div>
    </div>
  );
}

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "MonInvit.com — Invitations de mariage digitales, dessinées avec amour" },
      {
        name: "description",
        content:
          "Une invitation de mariage digitale élégante, prête en 10 minutes. RSVP, programme, invités, partage WhatsApp. Créée pour les mariés en Côte d'Ivoire, Sénégal, Bénin, Togo, Mali, Burkina Faso et toute l'Afrique de l'Ouest.",
      },
      { name: "author", content: "MonInvit.com" },
      { name: "keywords", content: "invitation mariage digitale, faire-part mariage en ligne, RSVP mariage, invitation dot Afrique, invitation mariage Côte d'Ivoire, invitation mariage Sénégal, invitation mariage Bénin, invitation mariage Togo, invitation mariage Mali, invitation mariage Burkina Faso, invitation mariage Afrique de l'Ouest, faire-part digital, invitation WhatsApp" },
      { name: "robots", content: "index, follow, max-image-preview:large" },
      { name: "theme-color", content: "#993556" },
      // Geo targeting — Afrique de l'Ouest
      { name: "geo.region", content: "CI" },
      { name: "geo.placename", content: "Abidjan, Côte d'Ivoire" },
      // Open Graph defaults
      { property: "og:site_name", content: "MonInvit.com" },
      { property: "og:type", content: "website" },
      { property: "og:locale", content: "fr_FR" },
      { property: "og:locale:alternate", content: "fr_CI" },
      { property: "og:locale:alternate", content: "fr_SN" },
      { property: "og:locale:alternate", content: "fr_BJ" },
      { property: "og:locale:alternate", content: "fr_TG" },
      { property: "og:locale:alternate", content: "fr_ML" },
      { property: "og:locale:alternate", content: "fr_BF" },
      { property: "og:title", content: "MonInvit.com — Invitations de mariage digitales, dessinées avec amour" },
      {
        property: "og:description",
        content:
          "Une invitation de mariage digitale élégante, prête en 10 minutes. RSVP, programme, invités, partage WhatsApp. Créée pour les mariés en Côte d'Ivoire, Sénégal, Bénin, Togo, Mali, Burkina Faso et toute l'Afrique de l'Ouest.",
      },
      // Twitter defaults
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:site", content: "@moninvit" },
      { name: "twitter:title", content: "MonInvit.com — Invitations de mariage digitales, dessinées avec amour" },
      { name: "twitter:description", content: "Une invitation de mariage digitale élégante, prête en 10 minutes. RSVP, programme, invités, partage WhatsApp. Créée pour les mariés en Côte d'Ivoire, Sénégal, Bénin, Togo, Mali, Burkina Faso et toute l'Afrique de l'Ouest." },
      { property: "og:image", content: "https://pub-bb2e103a32db4e198524a2e9ed8f35b4.r2.dev/ab558280-c910-4de6-ac6b-e1b2529247ec/id-preview-c49507f4--e93d96ce-2e56-46da-9063-996fb84fe947.lovable.app-1783800940078.png" },
      { name: "twitter:image", content: "https://pub-bb2e103a32db4e198524a2e9ed8f35b4.r2.dev/ab558280-c910-4de6-ac6b-e1b2529247ec/id-preview-c49507f4--e93d96ce-2e56-46da-9063-996fb84fe947.lovable.app-1783800940078.png" },
    ],
    links: [
      { rel: "stylesheet", href: appCss },
      { rel: "icon", type: "image/png", href: "/favicon.png" },
      { rel: "apple-touch-icon", href: "/favicon.png" },
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      {
        rel: "preconnect",
        href: "https://fonts.gstatic.com",
        crossOrigin: "anonymous",
      },
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,500;0,600;0,700;1,500;1,600&family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;0,600;0,700;1,400&family=Inter:wght@400;500;600&family=JetBrains+Mono:wght@400;500&family=Special+Elite&display=swap",
      },
    ],
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "Organization",
          name: "MonInvit.com",
          url: "https://moninvit.com",
          logo: "https://moninvit.com/favicon.png",
          description:
            "Plateforme d'invitations de mariage digitales pour l'Afrique de l'Ouest : RSVP, partage WhatsApp, gestion des invités.",
          areaServed: [
            { "@type": "Country", name: "Côte d'Ivoire" },
            { "@type": "Country", name: "Sénégal" },
            { "@type": "Country", name: "Bénin" },
            { "@type": "Country", name: "Togo" },
            { "@type": "Country", name: "Mali" },
            { "@type": "Country", name: "Burkina Faso" },
            { "@type": "Country", name: "Guinée" },
            { "@type": "Country", name: "Niger" },
          ],
          sameAs: [],
        }),
      },
    ],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});

function RootShell({ children }: { children: ReactNode }) {
  return (
    <html lang="fr">
      <head>
        <HeadContent />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  );
}

function RootComponent() {
  const { queryClient } = Route.useRouteContext();
  const router = useRouter();

  useEffect(() => {
    import("@/integrations/supabase/client").then(({ supabase }) => {
      const { data: sub } = supabase.auth.onAuthStateChange((event) => {
        if (
          event !== "SIGNED_IN" &&
          event !== "SIGNED_OUT" &&
          event !== "USER_UPDATED"
        )
          return;
        router.invalidate();
        if (event !== "SIGNED_OUT") queryClient.invalidateQueries();
      });
      return () => sub.subscription.unsubscribe();
    });
  }, [router, queryClient]);

  return (
    <QueryClientProvider client={queryClient}>
      <WeddingProvider>
        <Outlet />
      </WeddingProvider>
    </QueryClientProvider>
  );
}
