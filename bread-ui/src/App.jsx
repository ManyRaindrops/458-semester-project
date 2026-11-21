import { useState } from "react";
import { Alert, Snackbar } from "@mui/material";
import AppShell from "./components/AppShell.jsx";
import PantryScreen from "./screens/PantryScreen.jsx";
import RecipesScreen from "./screens/RecipesScreen.jsx";
import PlanScreen from "./screens/PlanScreen.jsx";
import SavedScreen from "./screens/SavedScreen.jsx";
import { rankRecipes, generateSchedule } from "./api.js";
import { loadSavedPlans, persistSavedPlans } from "./utils.js";

// Where the back arrow goes from each tab (no arrow on top-level tabs).
const BACK_TARGET = { recipes: "pantry", plan: "recipes" };

function friendlyError(err) {
  if (err instanceof TypeError) {
    return "Couldn't reach the Bread API. Make sure the backend is running on port 8000.";
  }
  return err?.message || "Something went wrong. Try again.";
}

const toggleIn = (list, item) =>
  list.includes(item) ? list.filter((x) => x !== item) : [...list, item];

export default function App() {
  // navigation & feedback
  const [tab, setTabState] = useState("pantry"); // "pantry" | "recipes" | "plan" | "saved"
  // Each tab change starts at the top of the new screen.
  const setTab = (next) => {
    setTabState(next);
    window.scrollTo({ top: 0 });
  };
  const [isLoading, setIsLoading] = useState(false);
  const [toast, setToast] = useState(null); // { severity, message }

  // screen 1: pantry & constraints
  const [pantryText, setPantryText] = useState("");
  const [exclusions, setExclusions] = useState([]);
  const [equipment, setEquipment] = useState(["skillet"]);
  const [freeWindows, setFreeWindows] = useState([
    { id: 1, day: "Thu", start: "18:00", end: "18:45" },
  ]);

  // screen 2: ranked recipes
  const [hasSearched, setHasSearched] = useState(false);
  const [matchedPantry, setMatchedPantry] = useState([]);
  const [rankedRecipes, setRankedRecipes] = useState([]);
  const [noMatchReason, setNoMatchReason] = useState(null);
  const [servings, setServings] = useState(1);

  // screen 3: plan
  const [planId, setPlanId] = useState(null);
  const [selectedRecipe, setSelectedRecipe] = useState(null);
  const [planServings, setPlanServings] = useState(1);
  const [shoppingList, setShoppingList] = useState([]);
  const [scheduleSource, setScheduleSource] = useState("fallback");
  const [scheduleBlocks, setScheduleBlocks] = useState([]);

  // screen 4: saved plans
  const [savedPlans, setSavedPlans] = useState(loadSavedPlans);
  const [planDirty, setPlanDirty] = useState(false);
  const isSaved = !planDirty && savedPlans.some((p) => p.id === planId);

  const updateSaved = (plans) => {
    setSavedPlans(plans);
    persistSavedPlans(plans);
  };

  // Editing a saved plan marks it unsaved again (Save updates it in place).
  const markDirty = (setter) => (value) => {
    setter(value);
    setPlanDirty(true);
  };

  // ---- handlers ---------------------------------------------------------
  const handleLoadSample = () => {
    setPantryText("2 chx breast, green onions, leftover rice, soy sauce, broccoli");
    setExclusions(["dairy"]);
    setEquipment(["skillet", "rice_cooker"]);
    setFreeWindows([
      { id: 1, day: "Thu", start: "18:00", end: "18:45" },
      { id: 2, day: "Fri", start: "12:00", end: "12:30" },
    ]);
  };

  const handleFindRecipes = async () => {
    setIsLoading(true);
    try {
      const data = await rankRecipes({
        pantry_text: pantryText,
        exclusions,
        equipment,
        free_windows: freeWindows,
      });
      setMatchedPantry(data.matched_pantry || []);
      setRankedRecipes(data.top_recipes || []);
      setNoMatchReason(data.no_match_reason || null);
      setHasSearched(true);
      setTab("recipes");
    } catch (err) {
      setToast({ severity: "error", message: friendlyError(err) });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelectRecipe = async (recipe) => {
    setIsLoading(true);
    try {
      const data = await generateSchedule({
        recipe_id: recipe.id,
        servings,
        free_windows: freeWindows,
      });
      setPlanId(`plan_${Date.now()}`);
      setPlanDirty(false);
      setSelectedRecipe(recipe);
      setPlanServings(servings);
      setScheduleSource(data?.source || "fallback");
      setScheduleBlocks(data?.schedule_blocks || []);
      setShoppingList(
        recipe.missing_ingredients.map((item) => ({
          ...item,
          qty: item.base_qty * servings,
          checked: false,
        })),
      );
      setTab("plan");
    } catch (err) {
      setToast({ severity: "error", message: friendlyError(err) });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSavePlan = () => {
    const plan = {
      id: planId,
      savedAt: Date.now(),
      selectedRecipe,
      servings: planServings,
      scheduleSource,
      shoppingList,
      scheduleBlocks,
    };
    const others = savedPlans.filter((p) => p.id !== planId);
    updateSaved([plan, ...others]);
    setPlanDirty(false);
    setToast({ severity: "success", message: "Plan saved" });
  };

  const handleOpenSaved = (plan) => {
    setPlanId(plan.id);
    setPlanDirty(false);
    setSelectedRecipe(plan.selectedRecipe);
    setPlanServings(plan.servings);
    setScheduleSource(plan.scheduleSource || "fallback");
    setShoppingList(plan.shoppingList || []);
    setScheduleBlocks(plan.scheduleBlocks || []);
    setTab("plan");
  };

  const handleDeleteSaved = (id) => {
    updateSaved(savedPlans.filter((p) => p.id !== id));
    setToast({ severity: "info", message: "Plan deleted" });
  };

  // ---- render -----------------------------------------------------------
  const backTarget = BACK_TARGET[tab];

  return (
    <AppShell
      tab={tab}
      onTabChange={setTab}
      onBack={backTarget ? () => setTab(backTarget) : null}
      loading={isLoading}
    >
      {tab === "pantry" && (
        <PantryScreen
          pantryText={pantryText}
          setPantryText={setPantryText}
          exclusions={exclusions}
          toggleExclusion={(x) => setExclusions(toggleIn(exclusions, x))}
          equipment={equipment}
          toggleEquipment={(x) => setEquipment(toggleIn(equipment, x))}
          freeWindows={freeWindows}
          setFreeWindows={setFreeWindows}
          onLoadSample={handleLoadSample}
          onSubmit={handleFindRecipes}
          loading={isLoading}
        />
      )}

      {tab === "recipes" && (
        <RecipesScreen
          hasSearched={hasSearched}
          matchedPantry={matchedPantry}
          recipes={rankedRecipes}
          noMatchReason={noMatchReason}
          servings={servings}
          setServings={setServings}
          onSelect={handleSelectRecipe}
          onGoPantry={() => setTab("pantry")}
          loading={isLoading}
        />
      )}

      {tab === "plan" && (
        <PlanScreen
          recipe={selectedRecipe}
          servings={planServings}
          source={scheduleSource}
          shoppingList={shoppingList}
          setShoppingList={markDirty(setShoppingList)}
          blocks={scheduleBlocks}
          setBlocks={markDirty(setScheduleBlocks)}
          onSave={handleSavePlan}
          isSaved={isSaved}
          onGoRecipes={() => setTab(hasSearched ? "recipes" : "pantry")}
        />
      )}

      {tab === "saved" && (
        <SavedScreen
          plans={savedPlans}
          onOpen={handleOpenSaved}
          onDelete={handleDeleteSaved}
          onGoPantry={() => setTab("pantry")}
        />
      )}

      <Snackbar
        open={!!toast}
        autoHideDuration={4000}
        onClose={() => setToast(null)}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
        sx={{ bottom: { xs: 96, md: 24 } }}
      >
        {toast ? (
          <Alert severity={toast.severity} variant="filled" onClose={() => setToast(null)} sx={{ width: "100%" }}>
            {toast.message}
          </Alert>
        ) : undefined}
      </Snackbar>
    </AppShell>
  );
}
