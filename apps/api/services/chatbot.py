import os
from functools import lru_cache
from typing import Optional

import google.generativeai as genai


class ChatbotConfigurationError(RuntimeError):
    """Raised when the Gemini configuration is missing or invalid."""


@lru_cache
def _build_model() -> genai.GenerativeModel:
    api_key = os.getenv("GEMINI_API_KEY")
    if not api_key:
        raise ChatbotConfigurationError(
            "GEMINI_API_KEY is not set. Please configure the Gemini API key."
        )

    model_name = os.getenv("GEMINI_MODEL", "gemini-flash-lite")

    genai.configure(api_key=api_key)
    return genai.GenerativeModel(model_name)


def ask_gemini(prompt: str, system_instruction: Optional[str] = None) -> str:
    """Send the user prompt to the Gemini API and return the generated answer."""
    try:
        model = _build_model()

        messages = []
        if system_instruction:
            messages.append({"role": "model", "parts": [system_instruction]})

        messages.append({"role": "user", "parts": [prompt]})

        response = model.generate_content(messages)
        text = getattr(response, "text", "") or ""
        return text.strip()
    except ChatbotConfigurationError:
        raise
    except Exception as exc:  # pragma: no cover - defensive logging
        raise RuntimeError(f"Gemini API request failed: {exc}") from exc

