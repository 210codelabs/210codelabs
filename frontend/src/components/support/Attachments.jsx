import React, { useCallback, useRef, useState } from "react";
import { Paperclip, X, FileText, Image as ImageIcon, Loader2, AlertCircle, Download } from "lucide-react";
import { getSupportSession } from "@/hooks/useSupportApi";

const MAX_FILES = 5;
const MAX_BYTES = 15 * 1024 * 1024;
const ALLOWED = new Set(["image/png", "image/jpeg", "image/gif", "image/webp", "application/pdf", "text/plain", "application/json", "text/csv"]);
const IS_IMAGE = /^image\//;

const fmtBytes = (n) => {
  if (n < 1024) return `${n} B`;
  if (n < 1024 * 1024) return `${(n / 1024).toFixed(1)} KB`;
  return `${(n / (1024 * 1024)).toFixed(1)} MB`;
};

/** Uploader used in New Ticket + Reply composer. */
export function AttachmentPicker({ attachments, setAttachments, disabled, testIdBase = "support-attach" }) {
  const base = `${process.env.REACT_APP_BACKEND_URL || ""}/api`;
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [drag, setDrag] = useState(false);
  const inputRef = useRef(null);

  const uploadOne = useCallback(async (file) => {
    const fd = new FormData();
    fd.append("file", file);
    const { token } = getSupportSession();
    const res = await fetch(`${base}/support/uploads`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
      body: fd,
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(data.detail || "Upload failed");
    return data;
  }, [base]);

  const handleFiles = useCallback(async (files) => {
    if (!files || files.length === 0) return;
    setError("");
    const incoming = Array.from(files);
    const roomLeft = MAX_FILES - attachments.length;
    if (roomLeft <= 0) { setError(`Up to ${MAX_FILES} attachments.`); return; }
    const picked = incoming.slice(0, roomLeft);
    for (const f of picked) {
      if (!ALLOWED.has(f.type)) { setError(`Unsupported file type: ${f.name}`); return; }
      if (f.size > MAX_BYTES) { setError(`${f.name} is larger than 15 MB`); return; }
    }
    setBusy(true);
    try {
      const uploaded = [];
      for (const f of picked) {
        // eslint-disable-next-line no-await-in-loop
        const u = await uploadOne(f);
        uploaded.push({ ...u, preview_type: f.type });
      }
      setAttachments([...attachments, ...uploaded]);
    } catch (err) {
      setError(err.message || "Upload failed");
    } finally { setBusy(false); }
  }, [attachments, setAttachments, uploadOne]);

  const onDrop = (e) => {
    e.preventDefault(); e.stopPropagation(); setDrag(false);
    if (disabled || busy) return;
    handleFiles(e.dataTransfer?.files);
  };
  const onBrowse = (e) => { handleFiles(e.target.files); if (inputRef.current) inputRef.current.value = ""; };
  const remove = (id) => setAttachments(attachments.filter((a) => a.id !== id));

  return (
    <div className="attach" data-testid={`${testIdBase}-picker`}>
      <div
        className={`attach__drop ${drag ? "is-drag" : ""} ${disabled || busy ? "is-disabled" : ""}`}
        onDragOver={(e) => { e.preventDefault(); if (!disabled && !busy) setDrag(true); }}
        onDragLeave={() => setDrag(false)}
        onDrop={onDrop}
        onClick={() => !disabled && !busy && inputRef.current && inputRef.current.click()}
        role="button" tabIndex={0}
        onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); inputRef.current && inputRef.current.click(); } }}
        aria-disabled={disabled || busy}
      >
        {busy ? <><Loader2 className="spin" aria-hidden="true" /> Uploading…</> : (<>
          <Paperclip aria-hidden="true" />
          <span>Drag &amp; drop or click to attach — PNG, JPG, GIF, WEBP, PDF, TXT, JSON, CSV up to 15&nbsp;MB · max {MAX_FILES}</span>
        </>)}
        <input ref={inputRef} type="file" className="attach__input" onChange={onBrowse} multiple disabled={disabled || busy}
          accept=".png,.jpg,.jpeg,.gif,.webp,.pdf,.txt,.json,.csv,image/*,application/pdf,text/plain,application/json,text/csv"
          data-testid={`${testIdBase}-input`} />
      </div>
      {error && <div className="support-alert support-alert--error" role="alert"><AlertCircle aria-hidden="true" />{error}</div>}
      {attachments.length > 0 && (
        <ul className="attach__list" data-testid={`${testIdBase}-list`}>
          {attachments.map((a) => (
            <li key={a.id} className="attach__chip">
              {IS_IMAGE.test(a.content_type) ? <ImageIcon aria-hidden="true" /> : <FileText aria-hidden="true" />}
              <span className="attach__name">{a.filename}</span>
              <span className="attach__size">{fmtBytes(a.size)}</span>
              <button type="button" className="attach__remove" aria-label={`Remove ${a.filename}`}
                onClick={() => remove(a.id)} data-testid={`${testIdBase}-remove-${a.id}`}>
                <X aria-hidden="true" />
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

/** Image/file previews shown inline in a ticket thread. */
export function AttachmentPreviews({ attachments, pathPrefix = "/support/files" }) {
  const base = `${process.env.REACT_APP_BACKEND_URL || ""}/api`;
  const { token } = getSupportSession();
  if (!attachments || attachments.length === 0) return null;
  const url = (id) => `${base}${pathPrefix}/${id}?auth=${encodeURIComponent(token || "")}`;
  return (
    <ul className="attach-preview" data-testid="support-attach-preview">
      {attachments.map((a) => {
        const isImage = IS_IMAGE.test(a.content_type);
        return (
          <li key={a.id} className={`attach-preview__item ${isImage ? "is-image" : "is-file"}`}>
            {isImage ? (
              <a href={url(a.id)} target="_blank" rel="noopener noreferrer" aria-label={`Open ${a.filename}`}>
                <img src={url(a.id)} alt={a.filename} loading="lazy" />
              </a>
            ) : (
              <a href={url(a.id)} target="_blank" rel="noopener noreferrer" className="attach-preview__file">
                <FileText aria-hidden="true" />
                <div>
                  <strong>{a.filename}</strong>
                  <span>{fmtBytes(a.size)}</span>
                </div>
                <Download aria-hidden="true" />
              </a>
            )}
          </li>
        );
      })}
    </ul>
  );
}
