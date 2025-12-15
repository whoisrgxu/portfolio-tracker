import os
from functools import lru_cache
from typing import Optional

from google import genai

class ChatbotConfigurationError(RuntimeError):
    """Raised when the Gemini configuration is missing or invalid."""


@lru_cache
def _build_client() -> genai.Client:
    api_key = os.getenv("GEMINI_API_KEY")
    if not api_key:
        raise ChatbotConfigurationError(
            "GEMINI_API_KEY is not set. Please configure the Gemini API key."
        )

    return genai.Client(api_key=api_key)


def ask_gemini(prompt: str, system_instruction: Optional[str] = None) -> str:
    """Send the user prompt to the Gemini API and return the generated answer."""
    try:
        client = _build_client()
        model_name = os.getenv("GEMINI_MODEL", "gemini-2.5-flash")

        contents = (
            [system_instruction, prompt] if system_instruction else prompt
        )

        response = client.models.generate_content(
            model=model_name,
            contents=contents,
        )
        text = getattr(response, "text", "") or ""
        return text.strip()
    except ChatbotConfigurationError:
        raise
    except Exception as exc:  # pragma: no cover - defensive logging
        raise RuntimeError(f"Gemini API request failed: {exc}") from exc
