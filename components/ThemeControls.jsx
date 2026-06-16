"use client";

import { useEffect, useMemo, useState } from "react";
import { FiCheck, FiMoon, FiSliders, FiSun } from "react-icons/fi";

const STORAGE_KEY = "tourbook_appearance";
const LEGACY_THEME_KEY = "tourbook_theme";

const defaultSettings = {
  mode: "light",
  text: "slate",
  accent: "teal",
};

const textPalettes = {
  slate: {
    label: "Slate",
    light: {
      foreground: "#0f172a",
      mutedStrong: "#334155",
      muted: "#64748b",
    },
    dark: {
      foreground: "#e5e7eb",
      mutedStrong: "#cbd5e1",
      muted: "#94a3b8",
    },
  },
  ocean: {
    label: "Ocean",
    light: {
      foreground: "#123047",
      mutedStrong: "#31516a",
      muted: "#64798a",
    },
    dark: {
      foreground: "#dbeafe",
      mutedStrong: "#bfdbfe",
      muted: "#93a9c5",
    },
  },
  forest: {
    label: "Forest",
    light: {
      foreground: "#143527",
      mutedStrong: "#365748",
      muted: "#667c70",
    },
    dark: {
      foreground: "#dcfce7",
      mutedStrong: "#bbf7d0",
      muted: "#9ab8a5",
    },
  },
  plum: {
    label: "Plum",
    light: {
      foreground: "#3b244f",
      mutedStrong: "#574466",
      muted: "#81718b",
    },
    dark: {
      foreground: "#f3e8ff",
      mutedStrong: "#e9d5ff",
      muted: "#b9a7c8",
    },
  },
};

const accentPalettes = {
  teal: {
    label: "Teal",
    value: "#0f766e",
    hover: "#115e59",
    soft: "#ccfbf1",
    faint: "#f0fdfa",
    ring: "#99f6e4",
    lightText: "#5eead4",
  },
  blue: {
    label: "Blue",
    value: "#2563eb",
    hover: "#1d4ed8",
    soft: "#dbeafe",
    faint: "#eff6ff",
    ring: "#bfdbfe",
    lightText: "#93c5fd",
  },
  rose: {
    label: "Rose",
    value: "#be123c",
    hover: "#9f1239",
    soft: "#ffe4e6",
    faint: "#fff1f2",
    ring: "#fecdd3",
    lightText: "#fda4af",
  },
  amber: {
    label: "Amber",
    value: "#b45309",
    hover: "#92400e",
    soft: "#fef3c7",
    faint: "#fffbeb",
    ring: "#fde68a",
    lightText: "#fcd34d",
  },
};

function safeJsonParse(value) {
  try {
    return JSON.parse(value);
  } catch {
    return null;
  }
}

function getInitialSettings() {
  if (typeof window === "undefined") return defaultSettings;

  const saved = safeJsonParse(window.localStorage.getItem(STORAGE_KEY));
  const legacyTheme = window.localStorage.getItem(LEGACY_THEME_KEY);
  const prefersDark =
    window.matchMedia &&
    window.matchMedia("(prefers-color-scheme: dark)").matches;

  return {
    mode:
      saved?.mode ||
      legacyTheme ||
      (prefersDark ? "dark" : defaultSettings.mode),
    text: saved?.text || defaultSettings.text,
    accent: saved?.accent || defaultSettings.accent,
  };
}

function getTextPalette(text, mode) {
  return (
    textPalettes[text]?.[mode] ||
    textPalettes[defaultSettings.text][mode] ||
    textPalettes.slate.light
  );
}

function getAccentPalette(accent) {
  return accentPalettes[accent] || accentPalettes[defaultSettings.accent];
}

function applyAppearance(settings) {
  const root = document.documentElement;
  const mode = settings.mode === "dark" ? "dark" : "light";
  const text = getTextPalette(settings.text, mode);
  const accent = getAccentPalette(settings.accent);

  root.classList.toggle("dark", mode === "dark");
  root.dataset.theme = mode;
  root.dataset.textColor = settings.text;
  root.dataset.accentColor = settings.accent;
  root.style.setProperty("--foreground", text.foreground);
  root.style.setProperty("--muted-strong", text.mutedStrong);
  root.style.setProperty("--muted", text.muted);
  root.style.setProperty("--accent", accent.value);
  root.style.setProperty("--accent-strong", accent.hover);
  root.style.setProperty("--accent-soft", accent.soft);
  root.style.setProperty("--accent-faint", accent.faint);
  root.style.setProperty("--accent-ring", accent.ring);
  root.style.setProperty("--accent-light", accent.lightText);
}

export default function ThemeControls({ className = "" }) {
  const [open, setOpen] = useState(false);
  const [settings, setSettings] = useState(getInitialSettings);

  useEffect(() => {
    applyAppearance(settings);
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
    window.localStorage.setItem(LEGACY_THEME_KEY, settings.mode);
  }, [settings]);

  const selectedText = useMemo(
    () => textPalettes[settings.text] || textPalettes.slate,
    [settings.text]
  );
  const selectedAccent = useMemo(
    () => accentPalettes[settings.accent] || accentPalettes.teal,
    [settings.accent]
  );

  const updateSettings = (changes) => {
    setSettings((current) => ({ ...current, ...changes }));
  };

  return (
    <div className={`relative ${className}`}>
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        aria-label="Open appearance controls"
        className="inline-flex h-10 w-10 items-center justify-center rounded-[8px] border border-slate-200 bg-white text-slate-700 dark:bg-[var(--card)] dark:text-[var(--foreground)] dark:border-[var(--border)] transition hover:border-teal-700 hover:text-teal-700" 
      >
        <FiSliders />
      </button>

      {open ? (
        <div className="absolute right-0 top-12 z-50 w-[min(20rem,calc(100vw-2rem))] rounded-[8px] border border-slate-200 bg-white p-4 text-slate-700 shadow-xl">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-sm font-black text-slate-950">Appearance</p>
              <p className="mt-1 text-xs font-medium text-slate-500">
                {selectedText.label} text, {selectedAccent.label} accent
              </p>
            </div>
            <button
              type="button"
              onClick={() =>
                updateSettings({
                  mode: settings.mode === "dark" ? "light" : "dark",
                })
              }
              className="inline-flex h-10 w-10 items-center justify-center rounded-[8px] border border-slate-200 bg-slate-50 text-slate-700 transition hover:border-teal-700 hover:text-teal-700"
              aria-label="Toggle light or dark mode"
            >
              {settings.mode === "dark" ? <FiSun /> : <FiMoon />}
            </button>
          </div>

          <div className="mt-4 grid grid-cols-2 gap-2">
            {["light", "dark"].map((mode) => {
              const active = settings.mode === mode;

              return (
                <button
                  key={mode}
                  type="button"
                  onClick={() => updateSettings({ mode })}
                  className={`inline-flex items-center justify-center gap-2 rounded-[8px] border px-3 py-2 text-sm font-semibold capitalize transition ${
                    active
                      ? "border-teal-700 bg-teal-50 text-teal-700"
                      : "border-slate-200 bg-white text-slate-700 hover:border-teal-700 hover:text-teal-700"
                  }`}
                >
                  {mode === "dark" ? <FiMoon /> : <FiSun />}
                  {mode}
                </button>
              );
            })}
          </div>

          <div className="mt-5">
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-slate-500">
              Text color
            </p>
            <div className="mt-3 grid grid-cols-4 gap-2">
              {Object.entries(textPalettes).map(([id, palette]) => {
                const active = settings.text === id;
                const swatch = palette[settings.mode] || palette.light;

                return (
                  <button
                    key={id}
                    type="button"
                    onClick={() => updateSettings({ text: id })}
                    className={`relative flex h-10 items-center justify-center rounded-[8px] border transition ${
                      active
                        ? "border-teal-700"
                        : "border-slate-200 hover:border-teal-700"
                    }`}
                    style={{ background: swatch.foreground }}
                    aria-label={`${palette.label} text color`}
                    title={palette.label}
                  >
                    {active ? <FiCheck className="text-white" /> : null}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="mt-5">
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-slate-500">
              Accent
            </p>
            <div className="mt-3 grid grid-cols-4 gap-2">
              {Object.entries(accentPalettes).map(([id, palette]) => {
                const active = settings.accent === id;

                return (
                  <button
                    key={id}
                    type="button"
                    onClick={() => updateSettings({ accent: id })}
                    className={`relative flex h-10 items-center justify-center rounded-[8px] border transition ${
                      active
                        ? "border-slate-950"
                        : "border-slate-200 hover:border-slate-500"
                    }`}
                    style={{ background: palette.value }}
                    aria-label={`${palette.label} accent color`}
                    title={palette.label}
                  >
                    {active ? <FiCheck className="text-white" /> : null}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
