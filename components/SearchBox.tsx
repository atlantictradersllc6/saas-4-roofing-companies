"use client";

import { useState, useRef, useEffect, useTransition } from "react";
import Link from "next/link";
import { searchAll, type SearchResult } from "@/app/actions";
import { IconSearch } from "./icons";

export default function SearchBox() {
  const [q, setQ] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [open, setOpen] = useState(false);
  const [pending, start] = useTransition();
  const boxRef = useRef<HTMLDivElement>(null);

  // Debounced live search as you type.
  useEffect(() => {
    if (q.trim().length < 2) {
      setResults([]);
      return;
    }
    const t = setTimeout(() => {
      start(async () => {
        const r = await searchAll(q);
        setResults(r);
        setOpen(true);
      });
    }, 250);
    return () => clearTimeout(t);
  }, [q]);

  // Close on outside click.
  useEffect(() => {
    const onDoc = (e: MouseEvent) => {
      if (boxRef.current && !boxRef.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, []);

  return (
    <div className="search-box" ref={boxRef}>
      <div className="search">
        <IconSearch />
        <input
          className="search-input"
          placeholder="Search jobs, customers…"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          onFocus={() => results.length && setOpen(true)}
          aria-label="Search"
        />
      </div>
      {open && (
        <div className="search-results">
          {pending && <div className="search-empty">Searching…</div>}
          {!pending && results.length === 0 && q.trim().length >= 2 && (
            <div className="search-empty">No matches for “{q.trim()}”.</div>
          )}
          {results.map((r, i) => (
            <Link
              key={i}
              href={r.href}
              className="search-item"
              onClick={() => { setOpen(false); setQ(""); }}
            >
              <span className="search-type">{r.type}</span>
              <span className="search-main">
                <span className="search-label">{r.label}</span>
                {r.sub && <span className="search-sub">{r.sub}</span>}
              </span>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
