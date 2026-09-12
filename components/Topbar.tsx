"use client";

import { useEffect, useState } from "react";
import { IconSearch, IconSun, IconMoon } from "./icons";

export default function Topbar({
  title,
  subtitle,
}: {
  title: string;
  subtitle: string;
}) {
  const [dark, setDark] = useState(false);

  // Read the saved theme once on mount (per-viewer convenience only).
  useEffect(() => {
    try {
      const saved = localStorage.getItem("rl-theme");
      if (saved === "dark" || saved === "light") {
        document.documentElement.setAttribute("data-theme", saved);
        setDark(saved === "dark");
      } else {
        setDark(matchMedia("(prefers-color-scheme: dark)").matches);
      }
    } catch {
      /* storage blocked — fall back to system theme */
    }
  }, []);

  const toggle = () => {
    const next = dark ? "light" : "dark";
    document.documentElement.setAttribute("data-theme", next);
    setDark(!dark);
    try {
      localStorage.setItem("rl-theme", next);
    } catch {
      /* ignore */
    }
  };

  return (
    <header className="topbar">
      <div>
        <div className="page-title">{title}</div>
        <div className="page-sub">{subtitle}</div>
      </div>
      <div className="search">
        <IconSearch />
        Search jobs, customers…
      </div>
      <button
        className="icon-btn"
        onClick={toggle}
        title="Toggle theme"
        aria-label="Toggle theme"
      >
        {dark ? <IconSun /> : <IconMoon />}
      </button>
      <div className="avatar" style={{ background: "var(--slate)" }}>
        DK
      </div>
    </header>
  );
}
