from dataclasses import dataclass, field
from typing import Any, Iterator, Optional

import pytest
from fastapi.testclient import TestClient

from app.core.auth import get_current_user_id
from app.core.database import get_supabase
from app.main import app

USER_ID = "11111111-1111-1111-1111-111111111111"


@dataclass
class FakeResult:
    data: Any


@dataclass
class FakeQuery:
    """Chainable stand-in for the PostgREST async query builder."""

    store: "FakeSupabase"
    table_name: str
    filters: dict[str, Any] = field(default_factory=dict)
    payload: Optional[dict[str, Any]] = None

    def select(self, *_: Any, **__: Any) -> "FakeQuery":
        return self

    def insert(self, payload: dict[str, Any]) -> "FakeQuery":
        self.payload = payload
        return self

    def update(self, payload: dict[str, Any]) -> "FakeQuery":
        self.payload = payload
        return self

    def eq(self, column: str, value: Any) -> "FakeQuery":
        self.filters[column] = value
        return self

    def order(self, *_: Any, **__: Any) -> "FakeQuery":
        return self

    async def execute(self) -> FakeResult:
        self.store.calls.append((self.table_name, self.filters, self.payload))
        return FakeResult(self.store.responses.get(self.table_name, []))


@dataclass
class FakeRpc:
    store: "FakeSupabase"
    name: str
    params: dict[str, Any]

    async def execute(self) -> FakeResult:
        self.store.rpc_calls.append((self.name, self.params))
        return FakeResult(self.store.responses.get(f"rpc:{self.name}", []))


@dataclass
class FakeSupabase:
    responses: dict[str, Any] = field(default_factory=dict)
    calls: list[tuple[str, dict[str, Any], Optional[dict[str, Any]]]] = field(default_factory=list)
    rpc_calls: list[tuple[str, dict[str, Any]]] = field(default_factory=list)

    def table(self, name: str) -> FakeQuery:
        return FakeQuery(self, name)

    def rpc(self, name: str, params: dict[str, Any]) -> FakeRpc:
        return FakeRpc(self, name, params)


@pytest.fixture
def fake_supabase() -> FakeSupabase:
    return FakeSupabase()


@pytest.fixture
def client(fake_supabase: FakeSupabase) -> Iterator[TestClient]:
    async def _supabase() -> FakeSupabase:
        return fake_supabase

    async def _user() -> str:
        return USER_ID

    app.dependency_overrides[get_supabase] = _supabase
    app.dependency_overrides[get_current_user_id] = _user
    with TestClient(app) as test_client:
        yield test_client
    app.dependency_overrides.clear()


@pytest.fixture
def anonymous_client() -> Iterator[TestClient]:
    with TestClient(app) as test_client:
        yield test_client
