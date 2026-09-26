/** Publication prices, in XOF (F CFA). Shared by the publish flow, the dashboard call to action and the guestbook add-on. */
export const BASE_PRICE_XOF = 24900;
export const GUESTBOOK_ADDON_XOF = 1990;

export const formatXof = (amount: number) => amount.toLocaleString("fr-FR");
