import React, { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { CheckCircle2, ExternalLink, Inbox, Loader2, LogOut, Pencil, RefreshCw, Search, Sparkles, Trash2, Wand2, XCircle } from "lucide-react";
import { useSeo } from "@/hooks/useSeo";
import { Logo } from "@/components/site/Logo";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { TOKEN_KEY, api, Login } from "@/pages/AdminMessagesPage";

const fmt = (d) => (d ? new Date(d).toLocaleString(undefined, { dateStyle: "medium", timeStyle: "short" }) : "—");
const scoreCls = (s) => (s >= 100 ? "score score--ok" : s >= 85 ? "score score--mid" : "score score--low");

function Editor({ id, token, onClose, onSaved }) {
  const [p, setP] = useState(null);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState("");
  const load = useCallback(() => api(`/admin/blog/posts/${id}`, { token }).then(setP), [id, token]);
  useEffect(() => { load(); }, [load]);
  if (!p) return <div className="admin__empty"><Loader2 className="spin" aria-hidden="true" /> Loading…</div>;
  const set = (k, v) => setP((x) => ({ ...x, [k]: v }));
  const save = async () => {
    setBusy(true); setMsg("");
    try {
      const body = { title: p.title, slug: p.slug, meta_title: p.meta_title, meta_description: p.meta_description, excerpt: p.excerpt, keyword: p.keyword,
        body_md: p.body_md, key_takeaways: p.key_takeaways.filter(Boolean), faq: p.faq.filter((f) => f.q && f.a), cover_alt: p.cover_alt };
      const d = await api(`/admin/blog/posts/${id}`, { method: "PATCH", token, body });
      setP((x) => ({ ...x, ...d })); setMsg(`Saved · score ${d.seo_score}/100`); onSaved();
    } catch (e) { setMsg(e.message); } finally { setBusy(false); }
  };
  const optimize = async () => {
    setBusy(true); setMsg("AI is optimizing this post… (about a minute)");
    await api(`/admin/blog/posts/${id}/optimize`, { method: "POST", token });
    setTimeout(async () => { await load(); setBusy(false); setMsg("Optimization finished — review the updated content."); onSaved(); }, 70000);
  };
  const field = (k, label, opts = {}) => (
    <div className="field">
      <label htmlFor={`ed-${k}`}>{label}{opts.count && <span className="optional"> ({(p[k] || "").length} chars, {opts.count})</span>}</label>
      {opts.area ? <textarea id={`ed-${k}`} rows={opts.rows || 3} value={p[k] || ""} onChange={(e) => set(k, e.target.value)} data-testid={`blog-editor-${k}`} />
        : <input id={`ed-${k}`} value={p[k] || ""} onChange={(e) => set(k, e.target.value)} data-testid={`blog-editor-${k}`} />}
    </div>
  );
  return (
    <div className="editor" data-testid="blog-editor">
      <div className="editor__main">
        {field("title", "Title", { count: "30–65" })}
        <div className="form-grid">{field("slug", "URL slug")}{field("keyword", "Focus keyword")}</div>
        {field("meta_title", "Meta title")}
        {field("meta_description", "Meta description", { area: true, rows: 2, count: "120–160" })}
        {field("excerpt", "Excerpt", { area: true, rows: 2 })}
        <div className="field">
          <label htmlFor="ed-takeaways">Key takeaways (one per line)</label>
          <textarea id="ed-takeaways" rows={4} value={(p.key_takeaways || []).join("\n")} onChange={(e) => set("key_takeaways", e.target.value.split("\n"))} data-testid="blog-editor-takeaways" />
        </div>
        {field("body_md", "Article (Markdown)", { area: true, rows: 18 })}
        <fieldset className="editor__faq">
          <legend>FAQ</legend>
          {(p.faq || []).map((f, i) => (
            <div key={i} className="editor__faq-row">
              <input aria-label={`Question ${i + 1}`} value={f.q} onChange={(e) => set("faq", p.faq.map((x, j) => (j === i ? { ...x, q: e.target.value } : x)))} />
              <textarea aria-label={`Answer ${i + 1}`} rows={2} value={f.a} onChange={(e) => set("faq", p.faq.map((x, j) => (j === i ? { ...x, a: e.target.value } : x)))} />
              <button type="button" className="btn btn-danger btn-pill btn-sm" onClick={() => set("faq", p.faq.filter((_, j) => j !== i))} aria-label={`Remove question ${i + 1}`}><Trash2 aria-hidden="true" /></button>
            </div>
          ))}
          <button type="button" className="btn btn-secondary btn-pill btn-sm" onClick={() => set("faq", [...(p.faq || []), { q: "", a: "" }])} data-testid="blog-editor-add-faq">Add question</button>
        </fieldset>
      </div>
      <aside className="editor__side">
        <div className="editor__score"><span className={scoreCls(p.seo_score)} data-testid="blog-editor-score">{p.seo_score}</span><span>/100 SEO + AI score</span></div>
        <ul className="seo-checks" data-testid="blog-editor-checks">
          {(p.seo_checks || []).map((c) => <li key={c.label} className={c.passed ? "ok" : "bad"}>{c.passed ? <CheckCircle2 aria-hidden="true" /> : <XCircle aria-hidden="true" />}{c.label}</li>)}
        </ul>
        {p.seo_stats && <p className="muted editor__stats">{p.seo_stats.words} words · {p.seo_stats.internal_links} internal links · {p.seo_stats.h2} sections</p>}
        <div className="editor__actions">
          <button type="button" className="btn btn-primary btn-pill btn-sm" disabled={busy} onClick={save} data-testid="blog-editor-save">{busy ? <Loader2 className="spin" aria-hidden="true" /> : null} Save & rescore</button>
          <button type="button" className="btn btn-secondary btn-pill btn-sm" disabled={busy || p.seo_score >= 100} onClick={optimize} data-testid="blog-editor-optimize"><Wand2 aria-hidden="true" /> Auto-fix with AI</button>
          <button type="button" className="btn btn-secondary btn-pill btn-sm" onClick={onClose}>Close</button>
        </div>
        {msg && <p className="editor__msg" role="status">{msg}</p>}
      </aside>
    </div>
  );
}

export default function AdminBlogPage() {
  useSeo({ title: "Admin — Blog", noindex: true });
  const [token, setToken] = useState(() => sessionStorage.getItem(TOKEN_KEY) || "");
  const [posts, setPosts] = useState([]);
  const [kw, setKw] = useState({ items: [], volume_enabled: false });
  const [settings, setSettings] = useState(null);
  const [runs, setRuns] = useState([]);
  const [edit, setEdit] = useState(null);
  const [err, setErr] = useState("");
  const [seedText, setSeedText] = useState("");

  const guard = useCallback((e) => { if (e.status === 401) { sessionStorage.removeItem(TOKEN_KEY); setToken(""); } else setErr(e.message); }, []);
  const loadAll = useCallback(async () => {
    if (!token) return;
    try {
      const [p, k, s, r] = await Promise.all([api("/admin/blog/posts", { token }), api("/admin/blog/keywords", { token }), api("/admin/blog/settings", { token }), api("/admin/blog/runs", { token })]);
      setPosts(p.items); setKw(k); setSettings(s); setRuns(r.items); setSeedText((s.seeds || []).join("\n"));
    } catch (e) { guard(e); }
  }, [token, guard]);
  useEffect(() => { loadAll(); }, [loadAll]);

  const active = runs.find((r) => r.status === "queued" || r.status === "running");
  useEffect(() => {
    if (!active) return undefined;
    const t = setInterval(loadAll, 5000);
    return () => clearInterval(t);
  }, [active, loadAll]);

  const call = async (path, method = "POST", body) => { setErr(""); try { await api(path, { method, token, body }); await loadAll(); } catch (e) { guard(e); } };
  const saveSettings = (patch) => call("/admin/blog/settings", "PUT", patch);

  if (!token) return <Login onLogin={setToken} />;
  const published = posts.filter((p) => p.status === "published").length;

  return (
    <div className="admin" data-testid="admin-blog">
      <header className="admin__bar">
        <div className="admin__bar-inner">
          <Logo testId="admin-bar-logo-link" />
          <nav className="admin__tabs" aria-label="Admin sections">
            <Link to="/admin/messages" className="admin__tab" data-testid="admin-tab-messages"><Inbox aria-hidden="true" /> Messages</Link>
            <Link to="/admin/blog" className="admin__tab is-active" aria-current="page" data-testid="admin-tab-blog">Blog</Link>
          </nav>
          <div className="admin__bar-actions">
            <button type="button" className="btn btn-secondary btn-pill btn-sm" onClick={loadAll} data-testid="admin-blog-refresh"><RefreshCw aria-hidden="true" /> Refresh</button>
            <button type="button" className="btn btn-secondary btn-pill btn-sm" onClick={() => { sessionStorage.removeItem(TOKEN_KEY); setToken(""); }} data-testid="admin-blog-logout"><LogOut aria-hidden="true" /> Sign out</button>
          </div>
        </div>
      </header>
      <main className="admin__main" id="main">
        <h1 className="sr-only">Blog engine</h1>
        <section className="engine" data-testid="blog-engine-card">
          <div className="engine__info">
            <p className="eyebrow">DAILY PUBLISHING</p>
            <p className="engine__title">A new post is created every morning</p>
            <p className="muted">{settings?.schedule || "Every day at 7:00 AM US Central"} · keyword research → article → SEO + AI optimization → cover image → {settings?.auto_publish ? "auto-publish" : "draft for your approval"}.</p>
            <div className="engine__stats"><span><strong>{published}</strong> published</span><span><strong>{posts.length - published}</strong> drafts</span><span><strong>{kw.items.filter((k) => !k.used).length}</strong> keywords queued</span></div>
          </div>
          <div className="engine__controls">
            <label className="engine__toggle"><Switch checked={!!settings?.auto_publish} onCheckedChange={(v) => saveSettings({ auto_publish: v })} data-testid="blog-autopublish-switch" /> Auto-publish</label>
            <label className="engine__toggle"><Switch checked={!!settings?.cover_images} onCheckedChange={(v) => saveSettings({ cover_images: v })} data-testid="blog-cover-switch" /> AI cover images</label>
            <button type="button" className="btn btn-primary btn-pill" disabled={!!active} onClick={() => call("/admin/blog/generate", "POST", {})} data-testid="blog-generate-now-button">
              {active ? <Loader2 className="spin" aria-hidden="true" /> : <Sparkles aria-hidden="true" />} {active ? "Working…" : "Generate a post now"}
            </button>
          </div>
          {active && <p className="engine__run" role="status" data-testid="blog-run-status"><Loader2 className="spin" aria-hidden="true" /> {active.step}</p>}
          {!active && runs[0]?.status === "error" && <p className="form-status form-status--error form-status--inline" role="alert">Last run failed: {runs[0].error}</p>}
        </section>
        {err && <p className="form-status form-status--error form-status--inline" role="alert" data-testid="admin-blog-error">{err}</p>}

        <Tabs defaultValue="posts" className="engine__tabs">
          <TabsList>
            <TabsTrigger value="posts" data-testid="blog-tab-posts">Posts ({posts.length})</TabsTrigger>
            <TabsTrigger value="keywords" data-testid="blog-tab-keywords">Keywords ({kw.items.length})</TabsTrigger>
            <TabsTrigger value="topics" data-testid="blog-tab-topics">Topics</TabsTrigger>
          </TabsList>

          <TabsContent value="posts">
            <div className="admin__list">
              {posts.length === 0 ? <div className="admin__empty" data-testid="blog-admin-empty">No posts yet — click “Generate a post now”.</div> : (
                <table className="atable" data-testid="blog-admin-posts-table">
                  <thead><tr><th>Post</th><th>Score</th><th>Status</th><th>Date</th><th><span className="sr-only">Actions</span></th></tr></thead>
                  <tbody>
                    {posts.map((p) => (
                      <tr key={p.id} data-testid="blog-admin-post-row">
                        <td><strong>{p.title}</strong><small>{p.keyword}</small></td>
                        <td><span className={scoreCls(p.seo_score)}>{p.seo_score}</span></td>
                        <td><span className={`tag ${p.status === "published" ? "tag--soft" : "tag--muted"}`}>{p.status}</span></td>
                        <td><small>{fmt(p.published_at || p.created_at)}</small></td>
                        <td className="atable__actions">
                          <button type="button" className="btn btn-secondary btn-pill btn-sm" onClick={() => setEdit(p.id)} data-testid="blog-admin-edit-button"><Pencil aria-hidden="true" /> Edit</button>
                          {p.status === "published"
                            ? <button type="button" className="btn btn-secondary btn-pill btn-sm" onClick={() => call(`/admin/blog/posts/${p.id}/unpublish`)} data-testid="blog-admin-unpublish-button">Unpublish</button>
                            : <button type="button" className="btn btn-primary btn-pill btn-sm" onClick={() => call(`/admin/blog/posts/${p.id}/publish`)} data-testid="blog-admin-publish-button">Approve & publish</button>}
                          {p.status === "published" && <a href={`/blog/${p.slug}`} target="_blank" rel="noopener noreferrer" className="btn btn-secondary btn-pill btn-sm" aria-label="View live post"><ExternalLink aria-hidden="true" /></a>}
                          <button type="button" className="btn btn-danger btn-pill btn-sm" onClick={() => window.confirm("Delete this post permanently?") && call(`/admin/blog/posts/${p.id}`, "DELETE")} aria-label="Delete post" data-testid="blog-admin-delete-button"><Trash2 aria-hidden="true" /></button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </TabsContent>

          <TabsContent value="keywords">
            <div className="engine__kwbar">
              <p className="muted">{kw.volume_enabled ? "Real Google suggestions ranked by AI, with search volume from DataForSEO." : "Real Google search suggestions ranked by AI for buyer intent. Search volume appears once a DataForSEO account is connected."}</p>
              <button type="button" className="btn btn-secondary btn-pill btn-sm" disabled={!!active} onClick={() => call("/admin/blog/keywords/research")} data-testid="blog-research-button"><Search aria-hidden="true" /> Research new keywords</button>
            </div>
            <div className="admin__list">
              <table className="atable" data-testid="blog-keywords-table">
                <thead><tr><th>Keyword</th><th>Intent</th><th>Priority</th>{kw.volume_enabled && <th>Volume</th>}<th>Status</th><th><span className="sr-only">Actions</span></th></tr></thead>
                <tbody>
                  {kw.items.map((k) => (
                    <tr key={k.id}>
                      <td><strong>{k.keyword}</strong>{k.angle && <small>{k.angle}</small>}</td>
                      <td><small>{k.intent}</small></td>
                      <td>{k.priority}</td>
                      {kw.volume_enabled && <td>{k.volume ?? "—"}</td>}
                      <td><span className={`tag ${k.used ? "tag--muted" : "tag--soft"}`}>{k.used ? "used" : "queued"}</span></td>
                      <td className="atable__actions">
                        {!k.used && <button type="button" className="btn btn-secondary btn-pill btn-sm" disabled={!!active} onClick={() => call("/admin/blog/generate", "POST", { keyword_id: k.id })} data-testid="blog-keyword-write-button">Write now</button>}
                        <button type="button" className="btn btn-danger btn-pill btn-sm" onClick={() => call(`/admin/blog/keywords/${k.id}`, "DELETE")} aria-label={`Remove ${k.keyword}`}><Trash2 aria-hidden="true" /></button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </TabsContent>

          <TabsContent value="topics">
            <div className="admin__detail" style={{ position: "static" }}>
              <div className="field">
                <label htmlFor="seeds">Seed topics for keyword research (one per line)</label>
                <textarea id="seeds" rows={10} value={seedText} onChange={(e) => setSeedText(e.target.value)} data-testid="blog-seeds-input" />
              </div>
              <button type="button" className="btn btn-primary btn-pill btn-sm" style={{ marginTop: 14 }} onClick={() => saveSettings({ seeds: seedText.split("\n") })} data-testid="blog-seeds-save">Save topics</button>
            </div>
          </TabsContent>
        </Tabs>
      </main>

      <Dialog open={!!edit} onOpenChange={(o) => !o && setEdit(null)}>
        <DialogContent className="editor-dialog">
          <DialogHeader><DialogTitle>Edit post</DialogTitle></DialogHeader>
          {edit && <Editor id={edit} token={token} onClose={() => setEdit(null)} onSaved={loadAll} />}
        </DialogContent>
      </Dialog>
    </div>
  );
}
