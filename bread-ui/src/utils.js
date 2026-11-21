// Small shared helpers: time formatting, labels and saved-plan storage.

export const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

/** "18:05" -> "6:05 PM" */
export function formatTime(hhmm) {
  if (!hhmm || !hhmm.includes(":")) return hhmm || "";
  const [h, m] = hhmm.split(":").map(Number);
  const suffix = h >= 12 ? "PM" : "AM";
  const hour12 = h % 12 === 0 ? 12 : h % 12;
  return `${hour12}:${String(m).padStart(2, "0")} ${suffix}`;
}

/** "tree_nuts" -> "Tree nuts" */
export function prettyLabel(id) {
  const text = id.replace(/_/g, " ");
  return text.charAt(0).toUpperCase() + text.slice(1);
}

/** Rounds quantities like 0.5 * 3 = 1.5 without float noise. */
export function formatQty(n) {
  return Number.isInteger(n) ? String(n) : String(Math.round(n * 100) / 100);
}

/** Steps that deserve a food-safety highlight in the plan timeline. */
export function isFoodSafetyStep(text = "") {
  return /165|internal temp|food.?safety|cross.?contam|raw (chicken|meat|poultry)/i.test(text);
}

// ---- Saved plans (localStorage) ----------------------------------------
const SAVED_KEY = "bread_saved_plans";
const LEGACY_KEY = "bread_saved_plan"; // single plan saved by the first UI

export function loadSavedPlans() {
  try {
    const raw = localStorage.getItem(SAVED_KEY);
    if (raw) return JSON.parse(raw);
    const legacy = localStorage.getItem(LEGACY_KEY);
    if (legacy) {
      const plan = JSON.parse(legacy);
      return [{ id: "legacy", savedAt: Date.now(), scheduleSource: "fallback", ...plan }];
    }
  } catch {
    // Storage blocked or corrupt: start with an empty list.
  }
  return [];
}

export function persistSavedPlans(plans) {
  try {
    localStorage.setItem(SAVED_KEY, JSON.stringify(plans));
  } catch {
    // Ignore: saving is a convenience, the app still works without it.
  }
}
