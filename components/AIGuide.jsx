"use client";

import { useMemo, useState } from "react";
import { requestWithFallback } from "@/utils/apiHelpers";
import {
  formatPrice,
  getDurationLabel,
  getItemId,
  getRating,
} from "@/utils/tourUtils";
import { FiCpu, FiMapPin, FiSend, FiZap } from "react-icons/fi";

const quickActions = [
  {
    label: "Best rated",
    prompt: "Show me the best rated tours.",
    filters: { sort: "recommended" },
  },
  {
    label: "Budget",
    prompt: "Find budget friendly tours under $150.",
    filters: { price: "150", sort: "price-low" },
  },
  {
    label: "Short trips",
    prompt: "Find short tours for a quick trip.",
    filters: { duration: "1", sort: "duration" },
  },
  {
    label: "Adventure",
    prompt: "Recommend adventure tours.",
    filters: { category: "Adventure" },
  },
];

function compactTour(tour) {
  return {
    id: getItemId(tour),
    title: tour.title || tour.name || "Tour",
    destination: tour.destination || "",
    category: tour.category || "",
    price: Number(tour.price || 0),
    duration: Number(tour.duration || 0),
    rating: getRating(tour),
  };
}

function normalizeText(value) {
  return String(value || "").toLowerCase();
}

function extractGuideReply(payload) {
  return (
    payload?.reply ||
    payload?.answer ||
    payload?.message ||
    payload?.data?.reply ||
    payload?.data?.answer ||
    ""
  );
}

function ratingScore(tour) {
  const score = Number.parseFloat(getRating(tour));
  return Number.isNaN(score) ? 0 : score;
}

function pickTours(prompt, tours) {
  const query = normalizeText(prompt);
  const wantsBudget =
    query.includes("budget") ||
    query.includes("cheap") ||
    query.includes("low price") ||
    query.includes("under");
  const wantsShort =
    query.includes("short") ||
    query.includes("quick") ||
    query.includes("one day") ||
    query.includes("1 day");
  const wantsAdventure =
    query.includes("adventure") ||
    query.includes("hiking") ||
    query.includes("wildlife") ||
    query.includes("camping");
  const wantsCulture =
    query.includes("culture") ||
    query.includes("cultural") ||
    query.includes("history") ||
    query.includes("local");

  return [...tours]
    .filter((tour) => {
      const category = normalizeText(tour.category);
      const title = normalizeText(tour.title);
      const description = normalizeText(tour.description);
      const haystack = `${category} ${title} ${description}`;
      const price = Number(tour.price || 0);
      const duration = Number(tour.duration || 0);

      if (wantsBudget && price > 150) return false;
      if (wantsShort && duration > 1) return false;
      if (
        wantsAdventure &&
        !/(adventure|hiking|wildlife|camping|trek|trail)/.test(haystack)
      ) {
        return false;
      }
      if (wantsCulture && !/(culture|cultural|history|local|heritage)/.test(haystack)) {
        return false;
      }

      return true;
    })
    .sort((a, b) => {
      if (wantsBudget) return Number(a.price || 0) - Number(b.price || 0);
      if (wantsShort) return Number(a.duration || 0) - Number(b.duration || 0);
      return ratingScore(b) - ratingScore(a);
    })
    .slice(0, 3);
}

function buildLocalReply(prompt, tours, filters) {
  const picks = pickTours(prompt, tours);

  if (!tours.length) {
    return "I do not see tour results yet. Try clearing filters or searching a destination first, then I can recommend the strongest matches.";
  }

  if (!picks.length) {
    return "I could not find a close match with the current filters. Try widening price, duration, or category and I will narrow the list again.";
  }

  const activeFilters = Object.entries(filters || {})
    .filter(([key, value]) => {
      if (key === "sort") return value && value !== "recommended";
      if (key === "nearby") return Boolean(value);
      return Boolean(value);
    })
    .map(([key, value]) => `${key}: ${value}`)
    .join(", ");

  const intro = activeFilters
    ? `Based on your filters (${activeFilters}), I would start with:`
    : "I would start with these matches:";
  const list = picks
    .map(
      (tour, index) =>
        `${index + 1}. ${tour.title || "Tour"} in ${
          tour.destination || "destination pending"
        } - ${formatPrice(tour.price)}, ${getDurationLabel(tour.duration)}, rating ${getRating(tour)}`
    )
    .join("\n");

  return `${intro}\n${list}\n\nTip: compare duration and pickup details before booking.`;
}

export default function AIGuide({ tours = [], filters = {}, onApplySuggestion }) {
  const [input, setInput] = useState("");
  const [thinking, setThinking] = useState(false);
  const [messages, setMessages] = useState([
    {
      role: "guide",
      content:
        "Tell me your budget, trip length, or travel style and I will help pick the right tour.",
    },
  ]);

  const tourContext = useMemo(
    () => tours.slice(0, 12).map(compactTour),
    [tours]
  );

  const askGuide = async (prompt) => {
    const question = prompt.trim();
    if (!question || thinking) return;

    setInput("");
    setThinking(true);
    setMessages((current) => [...current, { role: "user", content: question }]);

    let reply = "";

    try {
      const { data } = await requestWithFallback(
        "post",
        ["/ai/guide", "/ai/tour-guide", "/assistant/tour-guide"],
        {
          message: question,
          filters,
          tours: tourContext,
        }
      );

      reply = extractGuideReply(data);
    } catch {
      reply = buildLocalReply(question, tours, filters);
    }

    setMessages((current) => [
      ...current,
      {
        role: "guide",
        content: reply || buildLocalReply(question, tours, filters),
      },
    ]);
    setThinking(false);
  };

  return (
    <section className="rounded-[8px] border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <p className="inline-flex items-center gap-2 text-sm font-bold uppercase tracking-[0.2em] text-teal-700">
            <FiCpu />
            AI Guide
          </p>
          <h2 className="mt-2 text-2xl font-black text-slate-950">
            Find the right tour faster
          </h2>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">
            Ask for budget picks, quick trips, adventure ideas, or destination
            matches from the current results.
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          {quickActions.map((action) => (
            <button
              key={action.label}
              type="button"
              onClick={() => {
                onApplySuggestion?.(action.filters);
                askGuide(action.prompt);
              }}
              className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-4 py-2 text-xs font-bold text-slate-700 transition hover:border-teal-700 hover:text-teal-700"
            >
              <FiZap className="text-teal-700" />
              {action.label}
            </button>
          ))}
        </div>
      </div>

      <div className="mt-5 grid gap-3">
        <div className="max-h-72 overflow-y-auto rounded-[8px] border border-slate-200 bg-slate-50 p-4">
          {messages.map((message, index) => (
            <div
              key={`${message.role}-${index}`}
              className={`mb-3 max-w-[92%] rounded-[8px] px-4 py-3 text-sm leading-6 ${
                message.role === "user"
                  ? "ml-auto bg-teal-700 text-white"
                  : "bg-white text-slate-700"
              }`}
            >
              {message.content.split("\n").map((line, lineIndex) => (
                <p
                  key={`${message.role}-${index}-${lineIndex}`}
                  className="whitespace-pre-wrap"
                >
                  {line}
                </p>
              ))}
            </div>
          ))}
          {thinking ? (
            <div className="inline-flex items-center gap-2 rounded-[8px] bg-white px-4 py-3 text-sm font-semibold text-slate-600">
              <FiMapPin className="text-teal-700" />
              Checking tour matches...
            </div>
          ) : null}
        </div>

        <form
          className="flex flex-col gap-3 sm:flex-row"
          onSubmit={(event) => {
            event.preventDefault();
            askGuide(input);
          }}
        >
          <input
            type="text"
            value={input}
            onChange={(event) => setInput(event.target.value)}
            className="min-w-0 flex-1 rounded-[8px] border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-teal-700 focus:bg-white focus:ring-2 focus:ring-teal-200"
            placeholder="Example: family friendly tours under $200"
          />
          <button
            type="submit"
            disabled={thinking || !input.trim()}
            className="inline-flex items-center justify-center gap-2 rounded-full bg-slate-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-teal-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            <FiSend />
            Ask
          </button>
        </form>
      </div>
    </section>
  );
}
