from datetime import datetime, timezone

from backend.leadhunter import build_search_queries, normalize_result


def test_search_queries_use_prompt_services_and_recency_window():
    today = datetime(2026, 11, 9, tzinfo=timezone.utc)
    queries = build_search_queries(
        "Find SaaS development partners and AI agents within the last 14 days",
        today=today,
    )

    assert len(queries) == 2
    assert all("after:2026-10-26" in query for query in queries)
    assert any('"SaaS development"' in query for query in queries)
    assert any('"AI agents"' in query for query in queries)


def test_search_query_count_is_bounded_for_general_prompt():
    queries = build_search_queries("Find active buying opportunities in the US")

    assert len(queries) == 3
    assert all("after:" in query for query in queries)


def test_search_result_is_unverified_and_requires_explicit_signal():
    timestamp = "2026-11-09T12:00:00+00:00"
    candidate = normalize_result(
        {"url": "https://example.com/rfp", "title": "RFP: Looking for an AI development partner", "description": "Published recently"},
        "AI development query",
        timestamp,
    )
    ordinary_company = normalize_result(
        {"url": "https://example.com", "title": "AI software company", "description": "Enterprise platform provider"},
        "AI development query",
        timestamp,
    )

    assert candidate["intent_status"] == "UNVERIFIED"
    assert candidate["source_published_at"] is None
    assert candidate["discovered_at"] == timestamp
    assert ordinary_company is None