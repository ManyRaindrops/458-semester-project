import { useState } from "react";
import "./App.css";
import { rankRecipes, generateSchedule } from "./api.js";

// basic presets for phase 2
const EXCLUSION_OPTIONS = ["peanuts", "tree_nuts", "dairy", "gluten", "shellfish"];
const EQUIPMENT_OPTIONS = ["skillet", "rice_cooker", "microwave", "oven", "blender"];

function App() {
  // navigation & UI feedback
  const [step, setStep] = useState("pantry"); // "pantry" | "recipes" | "schedule"
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  // screen 1 inputs (pantry & constraints)
  const [pantryText, setPantryText] = useState("");
  const [exclusions, setExclusions] = useState([]);
  const [equipment, setEquipment] = useState(["skillet"]);
  const [freeWindows, setFreeWindows] = useState([
    { id: 1, day: "Thu", start: "18:00", end: "18:45" },
  ]);

  // screen 2 state (ranked recipes)
  const [matchedPantry, setMatchedPantry] = useState([]);
  const [rankedRecipes, setRankedRecipes] = useState([]);
  const [noMatchReason, setNoMatchReason] = useState(null);
  const [servings, setServings] = useState(1);

  // screen 3 state (shopping list & prep schedule)
  const [selectedRecipe, setSelectedRecipe] = useState(null);
  const [shoppingList, setShoppingList] = useState([]);
  const [scheduleSource, setScheduleSource] = useState("gemini");
  const [scheduleBlocks, setScheduleBlocks] = useState([]);
  const [isSaved, setIsSaved] = useState(false);

  // helpers
  const toggleOption = (list, setList, item) => {
    if (list.includes(item)) {
      setList(list.filter((x) => x !== item));
    } else {
      setList([...list, item]);
    }
  };

  const toggleItemCheck = (list, setList, id) => {
    setList(
      list.map((item) =>
        item.id === id ? { ...item, checked: !item.checked } : item
      )
    );
  };

  const updateBlockField = (id, field, value) => {
    setScheduleBlocks(
      scheduleBlocks.map((block) =>
        block.id === id ? { ...block, [field]: value } : block
      )
    );
  };

  // handlers
  const handleLoadSample = () => {
    setPantryText("chicken, rice, broccoli");
    setExclusions(["dairy"]);
    setEquipment(["skillet", "oven"]);
    setFreeWindows([
      { id: 1, day: "Thu", start: "18:00", end: "18:45" },
      { id: 2, day: "Fri", start: "12:00", end: "12:30" },
    ]);
  };

  const handleFindRecipes = async () => {
    setIsLoading(true);
    setErrorMsg("");
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
      setStep("recipes");
    } catch (err) {
      setErrorMsg(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelectRecipe = async (recipe) => {
    setSelectedRecipe(recipe);
    setIsLoading(true);
    setErrorMsg("");
    setIsSaved(false);
    try {
      const data = await generateSchedule({
        recipe_id: recipe.id,
        servings,
        free_windows: freeWindows,
      });
      setScheduleSource(data.source || "fallback");
      setScheduleBlocks(data.schedule_blocks || []);
      const scaledList = recipe.missing_ingredients.map((item) => ({
        ...item,
        qty: item.base_qty * servings,
        checked: false,
      }));
      setShoppingList(scaledList);
      setStep("schedule");
    } catch (err) {
      setErrorMsg(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSavePlan = () => {
    const plan = { selectedRecipe, servings, shoppingList, scheduleBlocks };
    localStorage.setItem("bread_saved_plan", JSON.stringify(plan));
    setIsSaved(true);
  };

  return (
    <div className="app-container">
      <header className="app-header">
        <h1>Bread</h1>
      </header>

      {errorMsg && <div className="error-banner">{errorMsg}</div>}
      {isLoading && <div className="loading">Loading...</div>}

      {/* Screen 1: step === "pantry" */}
      {step === "pantry" && (
        <section>
          <h2>1. Pantry & Constraints</h2>
          <button onClick={handleLoadSample}>Load Synthetic Sample</button>
          <textarea
            value={pantryText}
            onChange={(e) => setPantryText(e.target.value)}
            placeholder="e.g., 2 chx breast, green onions, rice"
          />
          <div>
            <h3>Allergens / Exclusions</h3>
            {EXCLUSION_OPTIONS.map((item) => (
              <label key={item}>
                <input
                  type="checkbox"
                  checked={exclusions.includes(item)}
                  onChange={() => toggleOption(exclusions, setExclusions, item)}
                />
                {item}
              </label>
            ))}
          </div>
          <div>
            <h3>Available Equipment</h3>
            {EQUIPMENT_OPTIONS.map((item) => (
              <label key={item}>
                <input
                  type="checkbox"
                  checked={equipment.includes(item)}
                  onChange={() => toggleOption(equipment, setEquipment, item)}
                />
                {item}
              </label>
            ))}
          </div>
          <div>
            <h3>Free Time Windows</h3>
            {freeWindows.map((window) => (
              <div key={window.id}>
                {window.day} {window.start} - {window.end}
              </div>
            ))}
          </div>
          <button onClick={handleFindRecipes}>Find Recipes</button>
        </section>
      )}

      {/* Screen 2: step === "recipes" */}
      {step === "recipes" && (
        <section>
          <h2>2. Ranked Recipes</h2>

          {matchedPantry.length > 0 && (
            <div className="matched-pantry">
              <strong>Matched Pantry: </strong>
              {matchedPantry.map((item) => (
                <span key={item.normalized_id}>
                  {item.raw} → {item.normalized_id} ({Math.round(item.confidence * 100)}%){" "}
                </span>
              ))}
            </div>
          )}

          <div>
            <label>
              Servings:
              <input
                type="number"
                value={servings}
                onChange={(e) => setServings(Math.max(1, Number(e.target.value)))}
                min={1}
              />
            </label>
          </div>

          {rankedRecipes.length > 0 ? (
            <ul>
              {rankedRecipes.map((recipe) => (
                <li key={recipe.id}>
                  <h3>
                    {recipe.title} ({recipe.total_minutes} min) — Score:{" "}
                    {recipe.total_score.toFixed(2)}
                  </h3>
                  <p>{recipe.explanation}</p>
                  <p>
                    Breakdown: Coverage {recipe.breakdown.pantry_coverage} | Time{" "}
                    {recipe.breakdown.time_fit} | Variety {recipe.breakdown.variety}
                  </p>
                  <p>Matched: {recipe.matched_ingredients.join(", ")}</p>
                  <p>
                    Missing:{" "}
                    {recipe.missing_ingredients
                      .map((m) => `${m.base_qty * servings} ${m.unit} ${m.name}`)
                      .join(", ")}
                  </p>
                  <button onClick={() => handleSelectRecipe(recipe)}>
                    Build Prep Schedule
                  </button>
                </li>
              ))}
            </ul>
          ) : (
            <p>{noMatchReason || "No recipes matched your pantry and constraints."}</p>
          )}

          <button onClick={() => setStep("pantry")}>Back</button>
        </section>
      )}

      {/* Screen 3: step === "schedule" */}
      {step === "schedule" && (
        <section>
          <h2>3. Shopping List & Prep Schedule</h2>

          <div>
            <strong>Selected:</strong> {selectedRecipe?.title} ({servings} servings) |{" "}
            <span>
              Source:{" "}
              {scheduleSource === "gemini"
                ? "AI Schedule (Gemini)"
                : "Offline Fallback Schedule"}
            </span>
          </div>

          <div>
            <h3>Shopping List</h3>
            {shoppingList.length > 0 ? (
              <ul>
                {shoppingList.map((item) => (
                  <li key={item.id}>
                    <label>
                      <input
                        type="checkbox"
                        checked={item.checked}
                        onChange={() =>
                          toggleItemCheck(shoppingList, setShoppingList, item.id)
                        }
                      />
                      {item.qty} {item.unit} {item.name}
                    </label>
                  </li>
                ))}
              </ul>
            ) : (
              <p>No missing ingredients!</p>
            )}
          </div>

          <div>
            <h3>Prep & Cook Schedule</h3>
            {scheduleBlocks.map((block) => (
              <div key={block.id}>
                <input
                  type="checkbox"
                  checked={block.checked}
                  onChange={() =>
                    toggleItemCheck(scheduleBlocks, setScheduleBlocks, block.id)
                  }
                />
                <span>{block.day} </span>
                <input
                  type="text"
                  value={block.start_time}
                  onChange={(e) =>
                    updateBlockField(block.id, "start_time", e.target.value)
                  }
                />
                <span> - </span>
                <input
                  type="text"
                  value={block.end_time}
                  onChange={(e) =>
                    updateBlockField(block.id, "end_time", e.target.value)
                  }
                />
                <span> ({block.duration_min}m): </span>
                <input
                  type="text"
                  value={block.step_text}
                  onChange={(e) =>
                    updateBlockField(block.id, "step_text", e.target.value)
                  }
                />
              </div>
            ))}
          </div>

          <button onClick={() => setStep("recipes")}>Back</button>
          <button onClick={handleSavePlan}>Save Plan</button>
          {isSaved && <p>Plan saved!</p>}
        </section>
      )}
    </div>
  );
}

export default App;