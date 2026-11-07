import os
import json
from openai import OpenAI
from app.core.security import settings

client = OpenAI(api_key=settings.OPENAI_API_KEY)

class AIEngine:
    @staticmethod
    async def analyze_dream(content: str, lang: str, intention: Optional[str] = None) -> Dict[str, Any]:
        """
        Implements Edgar Cayce's Multi-Layer Analysis engine.
        Returns a structured breakdown in the specified language.
        """
        prompt = f"Dream Content: {content}\n"
        if intention:
            prompt += f"Intention for this dream: {intention}\n"
        
        prompt += f"\nPlease provide a deep holistic analysis in {lang}. Structure the response strictly as JSON with these keys: physical, mental, spiritual, synthesis, and symbols."

        response = client.chat.completions.create(
            model="gpt-4o",
            messages=[
                {"role": "system", "content": settings.CAYCE_SYSTEM_PROMPT},
                {"role": "user", "content": prompt}
            ],
            response_format={"type": "json_object"}
        )
        
        return json.loads(response.choices[0].message.content)

    @staticmethod
    async def get_embedding(text: str) -> List[float]:
        """Generates embedding for semantic search using text-embedding-3-small."""
        response = client.embeddings.create(
            input=text,
            model="text-embedding-3-small"
        )
        return response.data[0].embedding
