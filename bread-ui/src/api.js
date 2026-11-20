const BACKEND_MODE = "mock" // change to fastapi for real backend

const MOCK_RANK_RESPONSE = {
  matched_pantry: [
    { raw: "2 chx breast", normalized_id: "chicken_breast", confidence: 0.94 },
    { raw: "green onions", normalized_id: "scallion", confidence: 0.91 },
    { raw: "rice", normalized_id: "white_rice", confidence: 0.98 },
    { raw: "soy sauce", normalized_id: "soy_sauce", confidence: 0.99 },
  ],
  no_match_reason: null,
  top_recipes: [
    {
      id: "rec_01",
      title: "15-Minute Garlic Chicken & Scallion Rice Bowl",
      total_minutes: 20,
      total_score: 0.91,
      breakdown: {
        pantry_coverage: 0.85,
        time_fit: 1.0,
        variety: 0.9,
      },
      explanation: "Uses 4 of your 5 ingredients and fits comfortably inside your 45-minute window.",
      matched_ingredients: ["Chicken Breast", "Scallions", "White Rice", "Soy Sauce"],
      missing_ingredients: [
        { id: "garlic", name: "Garlic Cloves", base_qty: 2, unit: "cloves" },
        { id: "sesame_oil", name: "Sesame Oil", base_qty: 1, unit: "tsp" },
      ],
    },
    {
      id: "rec_02",
      title: "One-Skillet Ginger Chicken Stir-Fry",
      total_minutes: 25,
      total_score: 0.84,
      breakdown: {
        pantry_coverage: 0.75,
        time_fit: 0.95,
        variety: 0.85,
      },
      explanation: "High pantry match using only a skillet; requires two fresh produce items.",
      matched_ingredients: ["Chicken Breast", "Scallions", "Soy Sauce"],
      missing_ingredients: [
        { id: "bell_pepper", name: "Bell Pepper", base_qty: 1, unit: "whole" },
        { id: "ginger", name: "Fresh Ginger", base_qty: 1, unit: "tbsp" },
      ],
    },
    {
      id: "rec_03",
      title: "Simple Egg & Scallion Fried Rice",
      total_minutes: 15,
      total_score: 0.78,
      breakdown: {
        pantry_coverage: 0.7,
        time_fit: 1.0,
        variety: 0.7,
      },
      explanation: "Fastest option using leftover rice and scallions, though you are missing eggs.",
      matched_ingredients: ["White Rice", "Scallions", "Soy Sauce"],
      missing_ingredients: [
        { id: "egg", name: "Large Eggs", base_qty: 2, unit: "eggs" },
        { id: "frozen_peas", name: "Frozen Peas", base_qty: 0.5, unit: "cup" },
      ],
    },
  ],
};

const MOCK_SCHEDULE_RESPONSE = {
  source: "gemini", // "gemini" | "fallback"
  schedule_blocks: [
    {
      id: "step_1",
      day: "Thu",
      start_time: "18:00",
      end_time: "18:05",
      duration_min: 5,
      step_text: "Rinse white rice and start cooking in rice cooker (or covered pot).",
      checked: false,
    },
    {
      id: "step_2",
      day: "Thu",
      start_time: "18:05",
      end_time: "18:10",
      duration_min: 5,
      step_text: "Dice chicken breast into 1-inch cubes; slice scallions and mince garlic.",
      checked: false,
    },
    {
      id: "step_3",
      day: "Thu",
      start_time: "18:10",
      end_time: "18:18",
      duration_min: 8,
      step_text: "Sear chicken in skillet over medium-high heat until internal temp reaches 165°F (74°C).",
      checked: false,
    },
    {
      id: "step_4",
      day: "Thu",
      start_time: "18:18",
      end_time: "18:20",
      duration_min: 2,
      step_text: "Toss chicken with soy sauce, sesame oil, and scallions; serve over cooked rice.",
      checked: false,
    },
  ],
};

/**
 * Ranks recipes using pantry and scheduling constraints.
 *
 * Receives: { pantry_text, exclusions, equipment, free_windows }
 * Returns: { matched_pantry, top_recipes, no_match_reason }
 */
export async function rankRecipes(payload) {
    if (BACKEND_MODE === "mock") {
        return MOCK_RANK_RESPONSE;
    }
    if (BACKEND_MODE === "fastapi") {
        const res = await fetch("http://localhost:8000/api/rank", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
        });
        if (!res.ok) throw new Error("Failed to fetch ranked recipes");
        return await res.json();
    }
}

/**
 * Generates a recipe schedule and shopping list.
 *
 * Receives: { recipe_id, servings, free_windows }
 * Returns: { source, shopping_list, schedule_blocks }
 * source is "gemini" or "fallback".
 */
export async function generateSchedule(payload) {
    if (BACKEND_MODE === "mock") {
        return MOCK_SCHEDULE_RESPONSE;
    }
    if (BACKEND_MODE === "fastapi") {
        const res = await fetch("http://localhost:8000/api/schedule", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
        });
        if (!res.ok) throw new Error("Failed to fetch schedule");
        return await res.json();
    }
}
