export type InteractionAction =
  | { type: "navigate"; url: string }
  | { type: "openModal"; modalId: string }
  | { type: "showToast"; message: string; variant?: "default" | "success" | "error" }
  | { type: "triggerApi"; url: string; method?: "GET" | "POST" }
  | { type: "scrollTo"; selector: string }
  | { type: "toggleClass"; className: string };

export type BlockInteraction = {
  onClick?: InteractionAction;
  onHover?: { action: InteractionAction; delay?: number };
  onScrollIntoView?: { action: InteractionAction; threshold?: number };
};

export function executeInteraction(action: InteractionAction): void {
  switch (action.type) {
    case "navigate": {
      if (action.url.startsWith("/")) {
        window.dispatchEvent(
          new CustomEvent("neot-navigate", { detail: { url: action.url } })
        );
      } else {
        window.open(action.url, "_blank", "noopener,noreferrer");
      }
      break;
    }
    case "openModal":
      window.dispatchEvent(
        new CustomEvent("neot-open-modal", { detail: { modalId: action.modalId } })
      );
      break;
    case "showToast":
      window.dispatchEvent(
        new CustomEvent("neot-toast", {
          detail: { message: action.message, variant: action.variant ?? "default" },
        })
      );
      break;
    case "triggerApi":
      fetch(action.url, { method: action.method ?? "GET" }).catch((err) =>
        console.error("[interaction-engine] triggerApi failed:", err)
      );
      break;
    case "scrollTo": {
      const el = document.querySelector(action.selector);
      el?.scrollIntoView({ behavior: "smooth", block: "start" });
      break;
    }
    case "toggleClass":
      document.body.classList.toggle(action.className);
      break;
  }
}
