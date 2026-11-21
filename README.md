# Bread: Pantry-Aware Recipe and Meal Prep Assistant

Bread is a prototype for helping students plan meals around ingredients on hand, dietary exclusions, kitchen equipment, and free time. The project currently includes a React frontend and a FastAPI backend. The frontend can run with canned mock responses for a UI demonstration or call the backend locally.

## Current progress

- The frontend has Pantry, Recipes, Plan, and Saved screens. It supports pantry text, exclusion and equipment selections, free-time windows, recipe cards, servings, a checkable/editable prep plan, a shopping checklist, and saved plans in browser `localStorage`.
- The frontend mock mode provides canned pantry matches, three recipe cards, shopping suggestions, and schedule blocks. It demonstrates the intended interface flow; these values are not produced by the backend matcher or ranker.
- The FastAPI app exposes `POST /api/rank` and `POST /api/schedule`. `/api/rank` currently returns one hard-coded example. `/api/schedule` uses a hard-coded recipe lookup and attempts to call Gemini when configured.
- `bread-api/matcher.py` and `bread-api/ranker.py` are placeholders. The schedule fallback in `bread-api/scheduler.py` is also unfinished, so schedule generation may fail when Gemini is not configured or returns an error.

## Run the frontend mock

Requirements: Node.js and npm.

```sh
cd bread-ui
npm install
npm run dev:mock
```

Open the local URL printed by Vite (usually `http://localhost:5173`). The mock mode is configured in `bread-ui/.env.mock` and does not require the API server.

## Run the FastAPI backend

Requirements: Python 3.10 or newer and pip. From the repository root:

```sh
python -m venv .venv
source .venv/bin/activate        # Windows: .venv\Scripts\activate
python -m pip install fastapi uvicorn python-dotenv google-genai numpy scikit-learn
cd bread-api
uvicorn main:app --reload
```

The API is available at `http://localhost:8000`; FastAPI's interactive API page is at `http://localhost:8000/docs`.

To call the backend from the frontend, open a second terminal:

```sh
cd bread-ui
npm install
npm run dev
```

The default frontend mode is `fastapi`, which sends requests to `http://localhost:8000`. The backend CORS configuration currently permits `http://localhost:5173`.

## Optional Gemini scheduling

The scheduler reads `GEMINI_API_KEY` from the backend process environment or a `.env` file loaded by `python-dotenv`. To enable the Gemini call, create `bread-api/.env` with:

```dotenv
GEMINI_API_KEY=your_key_here
```

Keep the key private and do not commit `.env`. Gemini scheduling is experimental: output is not validated against the supplied windows, and the no-key/error fallback is not implemented yet.

## Main files

| Path | Purpose |
| --- | --- |
| `bread-ui/src/App.jsx` | App state and navigation between screens; API flow and saving plans |
| `bread-ui/src/api.js` | Mock responses and HTTP calls to FastAPI |
| `bread-ui/src/screens/` | Pantry, recipe results, plan, and saved-plan UI |
| `bread-ui/src/utils.js` | Formatting helpers and browser local-storage persistence |
| `bread-api/main.py` | FastAPI request models and `/api/rank`, `/api/schedule` routes |
| `bread-api/scheduler.py` | Gemini schedule prompt and structured output schema; fallback is a TODO |
| `bread-api/matcher.py`, `bread-api/ranker.py` | Planned ingredient matching and recipe ranking; not implemented |

## Known limitations and next work

There is no recipe catalog or implemented pantry normalization, constraint filtering, or scoring model. The backend rank route returns a fixed sample and does not rank based on the submitted request. The scheduler uses a temporary recipe definition, has no schedule-window validator, and lacks its fallback implementation. Consequently, mock screenshots should be described as prototype UI output, not evidence of measured recommendation accuracy or working end-to-end backend behavior.

Next steps are to add a recipe dataset, implement pantry matching and ranking with exclusion/equipment/time constraints, implement and validate deterministic scheduling, and demonstrate plan generation and saving against the backend. Add automated checks and document their results as these features are completed.
