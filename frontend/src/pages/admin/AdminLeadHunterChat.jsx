import React, { useCallback, useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowUpRight, CircleAlert, ExternalLink, Loader2, MessageSquarePlus,
  Radar, Send, ShieldCheck, Sparkles,
} from "lucide-react";
import { useAdminApi } from "@/hooks/useAdminApi";

const SUGGESTIONS = [
  "Find US companies currently seeking an external AI development partner or AI implementation vendor within the last 30 days.",
  "Search for public requests for SaaS engineering partners or teams to take prototypes into production.",
  "Find recent requests for proposals or quotations involving cloud modernization and migration.",
];

const formatDate = (value) => value
  ? new Date(value).toLocaleString(undefined, { dateStyle: "medium", timeStyle: "short" })
  : "Publication date unavailable";

export default function AdminLeadHunterChat() {
  const api = useAdminApi();
  const [providers, setProviders] = useState([]);
  const [conversations, setConversations] = useState([]);
  const [conversationId, setConversationId] = useState(null);
  const [conversation, setConversation] = useState(null);
  const [prompt, setPrompt] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");
  const inputRef = useRef(null);
  const discoveryProvider = providers.find((item) => item.id === "dataforseo");
  const discoveryAvailable = discoveryProvider?.status?.startsWith("Configured") || false;

  const loadLists = useCallback(async () => {
    const [providerData, conversationData] = await Promise.all([
      api("/admin/crm/leadhunter/providers"),
      api("/admin/crm/leadhunter/conversations"),
    ]);
    setProviders(providerData.providers || []);
    setConversations(conversationData.items || []);
  }, [api]);

  useEffect(() => {
    let active = true;
    Promise.all([
      api("/admin/crm/leadhunter/providers"),
      api("/admin/crm/leadhunter/conversations"),
    ]).then(([providerData, conversationData]) => {
      if (!active) return;
      setProviders(providerData.providers || []);
      setConversations(conversationData.items || []);
    }).catch((e) => {
      if (active) setError(e.message);
    }).finally(() => {
      if (active) setLoading(false);
    });
    return () => { active = false; };
  }, [api]);

  useEffect(() => {
    if (!conversationId) return undefined;
    let active = true;
    api(`/admin/crm/leadhunter/conversations/${conversationId}`)
      .then((data) => { if (active) setConversation(data); })
      .catch((e) => { if (active) setError(e.message); });
    return () => { active = false; };
  }, [api, conversationId]);

  useEffect(() => {
    if (!conversationId || conversation?.status !== "running") return undefined;
    let active = true;
    let timer;
    const poll = async () => {
      try {
        const data = await api(`/admin/crm/leadhunter/conversations/${conversationId}`);
        if (!active) return;
        setConversation(data);
        if (data.status === "running") timer = window.setTimeout(poll, 1200);
        else await loadLists();
      } catch (e) {
        if (active) setError(e.message);
      }
    };
    timer = window.setTimeout(poll, 900);
    return () => {
      active = false;
      window.clearTimeout(timer);
    };
  }, [api, conversationId, conversation?.status, loadLists]);

  const openConversation = (id) => {
    setError("");
    setConversation(null);
    setConversationId(id);
  };

  const startNewConversation = () => {
    setConversationId(null);
    setConversation(null);
    setError("");
    setPrompt("");
    inputRef.current?.focus();
  };

  const sendMessage = async (value = prompt) => {
    const message = value.trim();
    if (!message || sending) return;
    setSending(true);
    setError("");
    setPrompt("");
    try {
      const result = await api("/admin/crm/leadhunter/chat", {
        method: "POST",
        body: { conversation_id: conversationId || undefined, message },
      });
      setConversationId(result.conversation_id);
      setConversation(await api(`/admin/crm/leadhunter/conversations/${result.conversation_id}`));
      await loadLists();
    } catch (e) {
      setError(e.message);
    } finally {
      setSending(false);
    }
  };

  const submit = (event) => {
    event.preventDefault();
    sendMessage();
  };

  const results = conversation?.results || [];
  const running = conversation?.status === "running";

  return (
    <div className="leadhunter-chat" data-testid="admin-leadhunter">
      <aside className="leadhunter-chat__rail" aria-label="LeadHunter conversations">
        <button type="button" className="btn btn-secondary btn-sm leadhunter-chat__new" onClick={startNewConversation}>
          <MessageSquarePlus aria-hidden="true" /> New Search
        </button>
        <p className="leadhunter-chat__rail-label">Recent conversations</p>
        {loading ? <p className="muted">Loading…</p> : conversations.length === 0 ? (
          <p className="muted leadhunter-chat__empty-history">Search history will appear here.</p>
        ) : (
          <ul className="leadhunter-chat__history">
            {conversations.map((item) => (
              <li key={item.id}>
                <button type="button" className={item.id === conversationId ? "is-active" : ""} onClick={() => openConversation(item.id)}>
                  <span>{item.title || "New search"}</span>
                  <small>{item.status === "running" ? "Searching" : item.status?.replaceAll("_", " ")}</small>
                </button>
              </li>
            ))}
          </ul>
        )}
        <Link className="leadhunter-chat__secondary" to="/admin/research">
          Company research <ArrowUpRight aria-hidden="true" />
        </Link>
      </aside>

      <section className="leadhunter-chat__main" aria-label="Buying-intent discovery chat">
        <header className="leadhunter-chat__top">
          <div>
            <p className="eyebrow">BUYING-INTENT DISCOVERY</p>
            <h1>LeadHunter AI</h1>
          </div>
          <span className={`leadhunter-chat__provider ${discoveryAvailable ? "is-configured" : "is-unavailable"}`}>
            {discoveryAvailable ? <ShieldCheck aria-hidden="true" /> : <CircleAlert aria-hidden="true" />}
            {discoveryProvider?.status || "Checking search provider"}
          </span>
        </header>

        {error && <p className="form-status form-status--error" role="alert">{error}</p>}

        {!conversation ? (
          <div className="leadhunter-chat__welcome">
            <span className="leadhunter-chat__mark"><Radar aria-hidden="true" /></span>
            <h2>What buyers should we find today?</h2>
            <p>Describe the companies or buying signals you’re looking for. LeadHunter AI searches for opportunities matching 210Codelabs services.</p>
            {!discoveryAvailable && !loading && (
              <div className="leadhunter-chat__availability" role="status">
                Live search is not configured. Messages are saved, but no search will run and no prospects will be generated. Configure an authorized search provider to enable discovery.
              </div>
            )}
            <div className="leadhunter-chat__suggestions" aria-label="Suggested searches">
              {SUGGESTIONS.map((suggestion) => (
                <button key={suggestion} type="button" onClick={() => sendMessage(suggestion)} disabled={sending || loading}>
                  <Sparkles aria-hidden="true" /> <span>{suggestion}</span>
                </button>
              ))}
            </div>
          </div>
        ) : (
          <div className="leadhunter-chat__thread" aria-live="polite">
            {(conversation.messages || []).map((message, index) => (
              <article key={`${message.created_at}-${index}`} className={`leadhunter-chat__message is-${message.role}`}>
                <span className="leadhunter-chat__avatar" aria-hidden="true">{message.role === "assistant" ? <Radar /> : "You"}</span>
                <div>
                  <strong>{message.role === "assistant" ? "LeadHunter AI" : "You"}</strong>
                  <p>{message.content}</p>
                </div>
              </article>
            ))}
            {running && (
              <div className="leadhunter-chat__progress" role="status">
                <Loader2 className="spin" aria-hidden="true" />
                <span>{conversation.progress?.step || "Planning live searches…"}</span>
                {conversation.progress?.total > 0 && <span>{conversation.progress.completed}/{conversation.progress.total}</span>}
              </div>
            )}
            {conversation.status === "interrupted" && (
              <button type="button" className="btn btn-secondary btn-sm" onClick={() => sendMessage("Resume the interrupted search")}>Resume search</button>
            )}
          </div>
        )}

        <form className="leadhunter-chat__composer" onSubmit={submit}>
          <label className="sr-only" htmlFor="leadhunter-chat-input">Describe the buyers or buying signals to find</label>
          <textarea
            id="leadhunter-chat-input"
            ref={inputRef}
            rows={2}
            maxLength={4000}
            value={prompt}
            onChange={(event) => setPrompt(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Enter" && !event.shiftKey) {
                event.preventDefault();
                sendMessage();
              }
            }}
            placeholder="Describe the buying signals or companies you want to discover…"
            disabled={sending || running}
          />
          <button type="submit" className="btn btn-primary" aria-label="Send message" disabled={!prompt.trim() || sending || running}>
            {sending ? <Loader2 className="spin" aria-hidden="true" /> : <Send aria-hidden="true" />}
          </button>
          <small>Enter to send · Shift+Enter for a new line</small>
        </form>
      </section>

      <aside className="leadhunter-chat__results" aria-label="Discovered opportunities">
        <header>
          <div><p className="eyebrow">LIVE RESULTS</p><h2>Opportunities</h2></div>
          <span className="tag tag--soft">{results.length}</span>
        </header>
        {running && <p className="muted">Results appear as each search group completes.</p>}
        {!running && results.length === 0 && (
          <p className="muted">No source-supported opportunities in this conversation yet.</p>
        )}
        {results.map((result) => (
          <article className="leadhunter-chat__result" key={result.id}>
            <div className="leadhunter-chat__result-title">
              <h3>{result.title}</h3>
              <span className="tag tag--soft">{result.intent_status}</span>
            </div>
            {result.excerpt && <p>{result.excerpt}</p>}
            <p className="leadhunter-chat__result-date">Published: {formatDate(result.source_published_at)}</p>
            <a href={result.url} target="_blank" rel="noopener noreferrer">Open source <ExternalLink aria-hidden="true" /></a>
            <small>{result.verification_note}</small>
          </article>
        ))}
        {results.length > 0 && <p className="leadhunter-chat__crm-note">CRM save is unavailable for unverified search previews.</p>}
        <div className="leadhunter-chat__source-status">
          <h3>Source status</h3>
          {providers.map((provider) => (
            <p key={provider.id}><span>{provider.name}</span><strong>{provider.status}</strong></p>
          ))}
          <small>Search-index pages are not proof of active intent. Verify the original source and publication date before qualification.</small>
        </div>
      </aside>
    </div>
  );
}