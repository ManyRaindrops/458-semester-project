"""FastAPI entry point and HTTP endpoints for the Bread prototype.

Run from this directory with ``uvicorn main:app --reload``. The route
responses currently contain prototype data; see the API README for details.
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_methods=["*"],
    allow_headers=["*"],
)

class TimeWindow(BaseModel):
    """A user's available time interval, using 24-hour ``HH:MM`` strings."""

    id: int
    day: str
    start: str
    end: str

class RankRequest(BaseModel):
    """Inputs accepted by ``POST /api/rank``."""

    pantry_text: str
    exclusions: list[str]
    equipment: list[str]
    free_windows: list[TimeWindow]

class ScheduleRequest(BaseModel):
    """Inputs accepted by ``POST /api/schedule``."""

    recipe_id: str
    servings: int
    free_windows: list[TimeWindow]

@app.post("/api/rank")
def rank_recipes(req: RankRequest):
    """Return pantry matches and recipe suggestions (currently hard-coded)."""
    # Replace with embedding matcher + linear ranker
    return {
        "matched_pantry": [
            {"raw": req.pantry_text, "normalized_id": "chicken_breast", "confidence": 0.95}
        ],
        "top_recipes": [
            {
                "id": "rec_1",
                "title": "FastAPI Chicken Stir-Fry",
                "total_minutes": 25,
                "total_score": 0.89,
                "explanation": f"Filtered out {req.exclusions} and matched your {req.equipment}.",
                "breakdown": {"pantry_coverage": 0.85, "time_fit": 1.0, "variety": 0.8},
                "matched_ingredients": ["chicken_breast", "rice"],
                "missing_ingredients": [
                    {"id": "ing_soy", "name": "soy sauce", "base_qty": 2, "unit": "tbsp"}
                ],
            }
        ],
        "no_match_reason": None,
    }

from scheduler import create_schedule

@app.post("/api/schedule")
def generate_schedule(req: ScheduleRequest):
    """Build a schedule for a temporary recipe and the submitted windows."""
    # Temporary mock recipe lookup until ranker.py/recipes.py is built
    recipe = {
        "id": req.recipe_id,
        "title": "Chicken & Broccoli Rice Bowl",
        "total_minutes": 25,
        "steps": [
            "Rinse rice and start cooking.",
            "Dice chicken and broccoli florets.",
            "Sauté chicken in skillet until internal temp reaches 165°F, then add broccoli and sauce.",
        ],
    }
    windows_dicts = [w.model_dump() for w in req.free_windows]
    return create_schedule(recipe, req.servings, windows_dicts)
