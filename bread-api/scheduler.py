"""Generate cooking schedule blocks with Gemini or a planned local fallback.

The fallback is currently a TODO, and generated schedules are not checked
against the requested time windows after generation.
"""

import os
import json
from dotenv import load_dotenv
from google import genai
from google.genai import types
from pydantic import BaseModel

load_dotenv() # loads GEMINI API key from .env file

class ScheduleBlock(BaseModel):
    """Structured fields expected for one item in a generated schedule."""

    id: str
    day: str
    start_time: str
    end_time: str
    duration_min: int
    step_text: str
    checked: bool = False

class GeminiScheduleOutput(BaseModel):
    """Structured response format requested from Gemini."""

    schedule_blocks: list[ScheduleBlock]

# deterministic fallback if Gemini fails or no API key is set
def build_fallback_schedule(recipe: dict, servings: int, free_windows: list) -> dict:
    """Return a deterministic schedule when Gemini is unavailable (unimplemented)."""
    pass

# primary function to create a cooking schedule using Gemini LLM
def create_schedule(recipe: dict, servings: int, free_windows: list) -> dict:
    """Ask Gemini for JSON schedule blocks, falling back on missing key/errors.

    ``recipe`` is expected to include a title, total duration, and optional
    steps. The result is tagged with ``source`` when generation succeeds.
    """
    if not os.getenv("GEMINI_API_KEY"):
        return build_fallback_schedule(recipe, servings, free_windows)
    try:
        client = genai.Client()
        prompt = f"""
        Create an ordered cooking and prep schedule for a college student.
        Recipe: {recipe['title']} ({recipe['total_minutes']} min total)
        Servings: {servings}
        Recipe Steps: {recipe.get('steps', [])}
        Available Free Windows: {free_windows}
        
        Rules:
        - Fit steps strictly inside the Available Free Windows.
        - Include a brief food-safety reminder if cooking meat/poultry.
        - Keep step_text concise and actionable.
        """

        response = client.models.generate_content(
            model="gemini-2.5-flash",
            contents=prompt,
            config=types.GenerateContentConfig(
                response_mime_type="application/json",
                response_schema=GeminiScheduleOutput,
                temperature=0.2,
            ),
        )

        parsed = json.loads(response.text)
        return {
            "source": "gemini",
            "schedule_blocks": parsed["schedule_blocks"],
        }

    except Exception as e:
        print(f"Gemini scheduler failed, using fallback: {e}")
        return build_fallback_schedule(recipe, servings, free_windows)
    
