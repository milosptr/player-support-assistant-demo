import json
import logging
import os

import requests

logger = logging.getLogger(__name__)

OPENROUTER_API_URL = "https://openrouter.ai/api/v1/chat/completions"
MODEL = "google/gemini-2.0-flash-001"

VALID_CATEGORIES = {"bug", "billing", "gameplay", "abuse", "feedback"}

SYSTEM_PROMPT = """You are a support assistant for a space MMO game (similar to EVE Online).

Given a player support ticket, you must:
1. Categorize it as exactly one of: bug, billing, gameplay, abuse, feedback
2. Write a suggested response to the player

Response rules:
- Professional and empathetic tone
- Reference game concepts naturally (ships, ISK, PLEX, corporations, systems, etc.)
- Keep it to 2-3 sentences
- Don't promise what you can't deliver (e.g., don't say "your ISK has been refunded" \
— say "I've escalated this to our billing team")
- For bugs: acknowledge and say it's been logged
- For billing: show urgency, mention escalation
- For gameplay: be helpful and specific
- For abuse: take it seriously, mention investigation
- For feedback: be genuinely appreciative

Return ONLY valid JSON in this exact format:
{"category": "bug|billing|gameplay|abuse|feedback", "response": "your suggested response here"}"""


def _parse_ai_content(content):
    """Strip markdown code fences before parsing JSON."""
    text = content.strip()
    if text.startswith("```"):
        lines = text.split("\n")
        # Remove first line (```json or ```) and last line (```)
        lines = lines[1:]
        if lines and lines[-1].strip() == "```":
            lines = lines[:-1]
        text = "\n".join(lines).strip()
    return json.loads(text)


def analyze_ticket(subject, message):
    """
    Send ticket to AI for categorization and response suggestion.
    Returns {"category": "...", "response": "..."} or empty dict on failure.
    """
    api_key = os.environ.get("OPENROUTER_API_KEY")
    if not api_key:
        logger.warning("OPENROUTER_API_KEY not set, skipping AI analysis")
        return {}

    try:
        response = requests.post(
            OPENROUTER_API_URL,
            headers={
                "Authorization": f"Bearer {api_key}",
                "Content-Type": "application/json",
            },
            json={
                "model": MODEL,
                "messages": [
                    {"role": "system", "content": SYSTEM_PROMPT},
                    {"role": "user", "content": f"Subject: {subject}\nMessage: {message}"},
                ],
                "temperature": 0.3,
            },
            timeout=30,
        )
        response.raise_for_status()

        content = response.json()["choices"][0]["message"]["content"]
        result = _parse_ai_content(content)

        if result.get("category") not in VALID_CATEGORIES:
            logger.warning("AI returned invalid category: %s", result.get("category"))
            return {}

        return {
            "category": result["category"],
            "response": result.get("response", ""),
        }

    except (requests.RequestException, KeyError, json.JSONDecodeError, ValueError) as e:
        logger.error("AI analysis failed: %s", e)
        return {}
