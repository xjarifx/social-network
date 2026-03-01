import { FormEvent, useState } from "react";
import { Search } from "lucide-react";
import { useNavigate } from "react-router-dom";

const demoTrends = [
  { category: "Technology · Trending", title: "AI tools for creators" },
  { category: "Lifestyle · Trending", title: "Weekend travel ideas" },
  { category: "Science · Trending", title: "New space telescope images" },
  { category: "Culture · Trending", title: "Top movies this month" },
];

export function RightSidebar() {
  const navigate = useNavigate();
  const [query, setQuery] = useState("");

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!query.trim()) return;
    navigate(`/search?q=${encodeURIComponent(query.trim())}`);
  };

  return (
    <aside className="sticky top-2 hidden w-88 shrink-0 self-start space-y-4 xl:block">
      <form
        onSubmit={handleSubmit}
        className="flex items-center gap-2 rounded-full border border-white/15 bg-black px-4 py-2.5"
      >
        <Search className="h-4 w-4 text-white/60" />
        <input
          type="text"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Search"
          className="w-full bg-transparent text-[15px] text-white placeholder:text-white/60 outline-none"
        />
      </form>

      <section className="rounded-2xl border border-white/15 bg-[#16181c] p-4">
        <div className="mb-2 flex items-start justify-between gap-2">
          <h3 className="text-[20px] leading-tight font-extrabold text-white">
            Subscribe to Premium
          </h3>
          <span className="rounded-md bg-[#00ba7c] px-2 py-0.5 text-[13px] font-bold text-white">
            50% off
          </span>
        </div>
        <p className="mb-4 text-[15px] leading-5 text-white/90">
          Get rid of ads, see your analytics, boost your replies and unlock 20+
          features.
        </p>
        <button
          onClick={() => navigate("/billing")}
          className="rounded-full bg-[#1d9bf0] px-4 py-2 text-[15px] font-bold text-white transition hover:bg-[#1a8cd8] cursor-pointer"
        >
          Subscribe
        </button>
      </section>

      <section className="rounded-2xl border border-white/15 bg-[#16181c] p-4">
        <h3 className="mb-2 text-[20px] font-extrabold text-white">
          What’s happening
        </h3>
        <div className="space-y-1">
          {demoTrends.map((trend) => (
            <button
              key={trend.title}
              className="block w-full rounded-xl px-2 py-3 text-left transition hover:bg-white/5 cursor-pointer"
            >
              <p className="text-[13px] text-white/60">{trend.category}</p>
              <p className="mt-0.5 text-[17px] leading-5 font-bold text-white">
                {trend.title}
              </p>
            </button>
          ))}
        </div>
        <button className="mt-2 rounded-full px-3 py-1.5 text-[15px] text-[#1d9bf0] transition hover:bg-white/5 cursor-pointer">
          Show more
        </button>
      </section>
    </aside>
  );
}
