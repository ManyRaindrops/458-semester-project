# Bread API

This directory contains the FastAPI prototype for the Bread meal-planning app. It defines pantry-ranking and schedule-generation routes and a separate schedule helper. Recipe matching and ranking are still placeholders; current responses are not production recommendations.

## Setup and run

From this directory, create and activate a virtual environment, install the imported packages, and start the development server:

```sh
python -m venv .venv
source .venv/bin/activate        # macOS/Linux
# Windows PowerShell: .venv\Scripts\Activate.ps1
python -m pip install fastapi uvicorn pydantic python-dotenv google-genai numpy scikit-learn
uvicorn main:app --reload
```

The API runs at `http://localhost:8000`; interactive request documentation is available at `http://localhost:8000/docs`. The app currently allows browser requests from `http://localhost:5173`.

## Routes

### `POST /api/rank`

Request fields:

```json
{
  "pantry_text": "chicken, rice",
  "exclusions": ["dairy"],
  "equipment": ["skillet"],
  "free_windows": [
    {"id": 1, "day": "Thu", "start": "18:00", "end": "18:45"}
  ]
}
```

The current implementation returns one fixed pantry match and one fixed recipe. It does not normalize the submitted text or apply the exclusions, equipment, or time constraints to a recipe catalog.

### `POST /api/schedule`

Request fields:

```json
{
  "recipe_id": "rec_1",
  "servings": 2,
  "free_windows": [
    {"id": 1, "day": "Thu", "start": "18:00", "end": "18:45"}
  ]
}
```

The endpoint currently looks up a temporary hard-coded recipe and passes it to `scheduler.create_schedule`. If `GEMINI_API_KEY` is available, the scheduler asks Gemini for structured schedule blocks. It does not validate the generated blocks against the requested windows. The deterministic fallback is not implemented, so a missing key or Gemini error can result in no usable schedule.

To enable the Gemini call, set `GEMINI_API_KEY` in the process environment or add it to a local `.env` file in this directory. Do not commit credentials.

## Modules

- `main.py` — FastAPI app, request models, CORS configuration, and route handlers.
- `scheduler.py` — Gemini prompt/output schema and the unfinished fallback function.
- `matcher.py` — placeholder for converting free-text pantry entries into canonical ingredient IDs.
- `ranker.py` — placeholder for filtering and scoring recipes against student constraints.

The matcher and ranker modules currently define no callable implementation. The route payload models and mock output are prototype contracts that may change as those components are built.
