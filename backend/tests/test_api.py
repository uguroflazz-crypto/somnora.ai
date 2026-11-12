from typing import Any, List, Optional

import pytest
from fastapi.testclient import TestClient

from app.core.errors import AIEngineError
from app.services.ai_engine import AIEngine, DreamAnalysis
from tests.conftest import USER_ID, FakeSupabase

DREAM_ID = "22222222-2222-2222-2222-222222222222"
INCUBATION_ID = "33333333-3333-3333-3333-333333333333"
NOW = "2026-11-12T10:00:00+00:00"


@pytest.fixture
def stub_ai(monkeypatch: pytest.MonkeyPatch) -> dict[str, Any]:
    seen: dict[str, Any] = {}

    async def analyze(content: str, lang: str, intention: Optional[str] = None) -> DreamAnalysis:
        seen.update(content=content, lang=lang, intention=intention)
        return DreamAnalysis(
            physical="p", mental="m", spiritual="s", synthesis="x", symbols=["water", "door"]
        )

    async def embed(text: str) -> List[float]:
        return [0.1, 0.2]

    monkeypatch.setattr(AIEngine, "analyze_dream", staticmethod(analyze))
    monkeypatch.setattr(AIEngine, "get_embedding", staticmethod(embed))
    return seen


def test_health(anonymous_client: TestClient) -> None:
    assert anonymous_client.get("/health").json() == {"status": "ok"}


def test_protected_route_requires_token(anonymous_client: TestClient) -> None:
    res = anonymous_client.get("/api/v1/symbols/")
    assert res.status_code == 401
    assert res.headers["www-authenticate"] == "Bearer"


def test_token_check_needs_configured_supabase(anonymous_client: TestClient) -> None:
    res = anonymous_client.get(
        "/api/v1/symbols/", headers={"Authorization": "Bearer not-a-real-token"}
    )
    assert res.status_code == 503


def test_create_dream_stores_analysis_and_symbols(
    client: TestClient, fake_supabase: FakeSupabase, stub_ai: dict[str, Any]
) -> None:
    fake_supabase.responses["dreams"] = [
        {
            "id": DREAM_ID,
            "user_id": USER_ID,
            "incubation_id": None,
            "content": "I flew over the sea",
            "analysis_result": {"physical": "p", "mental": "m", "spiritual": "s", "synthesis": "x"},
            "embedding": [0.1, 0.2],
            "created_at": NOW,
        }
    ]
    res = client.post("/api/v1/dreams/", json={"content": "I flew over the sea", "language": "tr"})

    assert res.status_code == 200
    body = res.json()
    assert body["analysis_result"]["synthesis"] == "x"
    assert "embedding" not in body
    assert stub_ai["lang"] == "tr"
    inserted = fake_supabase.calls[0][2]
    assert inserted is not None and inserted["user_id"] == USER_ID
    assert [p["row_symbol"] for _, p in fake_supabase.rpc_calls] == ["water", "door"]


def test_create_dream_uses_incubation_intention(
    client: TestClient, fake_supabase: FakeSupabase, stub_ai: dict[str, Any]
) -> None:
    fake_supabase.responses["incubations"] = [{"intention": "find clarity"}]
    fake_supabase.responses["dreams"] = [
        {"id": DREAM_ID, "user_id": USER_ID, "content": "c", "created_at": NOW}
    ]
    res = client.post(
        "/api/v1/dreams/", json={"content": "c", "incubation_id": INCUBATION_ID}
    )
    assert res.status_code == 200
    assert stub_ai["intention"] == "find clarity"


def test_create_dream_unknown_incubation_is_404(
    client: TestClient, stub_ai: dict[str, Any]
) -> None:
    res = client.post(
        "/api/v1/dreams/", json={"content": "c", "incubation_id": INCUBATION_ID}
    )
    assert res.status_code == 404


def test_create_dream_rejects_unknown_language(client: TestClient) -> None:
    res = client.post("/api/v1/dreams/", json={"content": "c", "language": "de"})
    assert res.status_code == 422


def test_ai_failure_maps_to_502(
    client: TestClient, monkeypatch: pytest.MonkeyPatch
) -> None:
    async def failing(*_: Any, **__: Any) -> DreamAnalysis:
        raise AIEngineError("Dream analysis provider failed.")

    monkeypatch.setattr(AIEngine, "analyze_dream", staticmethod(failing))
    res = client.post("/api/v1/dreams/", json={"content": "c"})
    assert res.status_code == 502


def test_search_route_is_not_shadowed_by_dream_id(
    client: TestClient, fake_supabase: FakeSupabase, stub_ai: dict[str, Any]
) -> None:
    fake_supabase.responses["rpc:match_dreams"] = [
        {"id": DREAM_ID, "content": "sea", "similarity": 0.91}
    ]
    res = client.get("/api/v1/dreams/search", params={"query": "ocean"})
    assert res.status_code == 200
    assert res.json()[0]["similarity"] == 0.91
    assert fake_supabase.rpc_calls[0][1]["filter_user_id"] == USER_ID


def test_get_dream_not_found(client: TestClient) -> None:
    assert client.get(f"/api/v1/dreams/{DREAM_ID}").status_code == 404


def test_narration_validates_voice(client: TestClient) -> None:
    res = client.post("/api/v1/narration/synthesize", json={"text": "hi", "voice": "robot"})
    assert res.status_code == 422


def test_incubation_create_and_list(client: TestClient, fake_supabase: FakeSupabase) -> None:
    row = {
        "id": INCUBATION_ID,
        "intention": "heal",
        "category": None,
        "status": "active",
        "created_at": NOW,
    }
    fake_supabase.responses["incubations"] = [row]
    assert client.post("/api/v1/incubations/", json={"intention": " heal "}).status_code == 200
    assert fake_supabase.calls[0][2] == {"user_id": USER_ID, "intention": "heal", "category": None}
    assert client.get("/api/v1/incubations/active").json()[0]["intention"] == "heal"


def test_dream_analysis_normalizes_llm_output() -> None:
    analysis = DreamAnalysis.model_validate(
        {
            "physical": {"body": "tension", "health": "rest"},
            "mental": ["fear", "change"],
            "spiritual": "growth",
            "synthesis": "x",
            "symbols": [{"name": "Water"}, "water", " Door ", 5],
        }
    )
    assert analysis.physical == "tension rest"
    assert analysis.mental == "fear change"
    assert analysis.symbols == ["water", "door"]
