import { usePageBuilderStore } from "./pageBuilderStore";
import { useHistoryStore } from "./historyStore";

export function initHistoryMiddleware() {
  let previousSections: string | null = null;

  usePageBuilderStore.subscribe((state) => {
    const serialized = JSON.stringify(state.sections);

    if (previousSections === null) {
      previousSections = serialized;
      return;
    }

    const prev = previousSections;
    previousSections = serialized;

    if (prev === serialized) return;
    if (useHistoryStore.getState().isUndoing) return;

    const snapshot = {
      id: crypto.randomUUID(),
      timestamp: Date.now(),
      label: "Auto-save",
      data: prev,
    };

    useHistoryStore.getState().pushSnapshot(snapshot);
  });
}

export function setUndoing(value: boolean) {
  useHistoryStore.getState().setUndoing(value);
}
