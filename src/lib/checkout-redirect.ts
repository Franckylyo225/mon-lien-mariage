/**
 * Force la sortie du SPA vers l'URL de paiement Paystack.
 * On tente plusieurs mécanismes : certains navigateurs mobiles ignorent
 * `location.assign` juste après une requête réseau, et un simple lien
 * cliqué programmatiquement passe alors mieux.
 */
export function redirectToCheckout(url: string): void {
  if (typeof window === "undefined") return;
  if (!/^https?:\/\//i.test(url)) {
    throw new Error("URL de paiement invalide.");
  }

  try {
    window.location.assign(url);
  } catch {
    /* on tente les replis ci-dessous */
  }

  // Repli 1 : affectation directe (peu après, si la page est encore là).
  window.setTimeout(() => {
    if (typeof document === "undefined") return;
    try {
      window.location.href = url;
    } catch {
      /* repli suivant */
    }
  }, 120);

  // Repli 2 : clic sur un lien réel (navigateurs in-app / WebView).
  window.setTimeout(() => {
    if (typeof document === "undefined") return;
    const a = document.createElement("a");
    a.href = url;
    a.rel = "noopener";
    a.style.display = "none";
    document.body.appendChild(a);
    a.click();
    a.remove();
  }, 400);
}
