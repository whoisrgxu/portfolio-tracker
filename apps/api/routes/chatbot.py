from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field

from services.chatbot import ChatbotConfigurationError, ask_gemini

router = APIRouter()


class ChatbotRequest(BaseModel):
    question: str = Field(..., min_length=3, max_length=2000)


class ChatbotResponse(BaseModel):
    answer: str


@router.post("/query", response_model=ChatbotResponse)
async def query_chatbot(payload: ChatbotRequest) -> ChatbotResponse:
    """Proxy the chat request to the Gemini API."""
    try:
        answer = ask_gemini(
            prompt=payload.question,
            system_instruction=(
                "You are a helpful stock market assistant. "
                "Answer concisely with relevant financial context. "
                "If you are unsure, say you do not know."
            ),
        )
        if not answer:
            answer = (
                "I couldn't find a clear answer. "
                "Please try rephrasing your question or include more details."
            )
        return ChatbotResponse(answer=answer)
    except ChatbotConfigurationError as exc:
        raise HTTPException(status_code=500, detail=str(exc)) from exc
    except Exception as exc:
        raise HTTPException(status_code=502, detail=str(exc)) from exc

