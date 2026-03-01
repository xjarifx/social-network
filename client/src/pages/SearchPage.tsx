import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { usersAPI, type User } from "../services/api";
import { useAuth } from "../context/auth-context";
import { ChevronLeft, Search } from "lucide-react";
import { Button } from "../components/ui/button";
import { ProBadge } from "../components";

export default function SearchPage() {
  const navigate = useNavigate();
  const { user: currentUser } = useAuth();
  const [searchParams] = useSearchParams();
  const query = searchParams.get("q") || "";

  const [results, setResults] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [total, setTotal] = useState(0);
  const [offset, setOffset] = useState(0);
  const limit = 20;

  useEffect(() => {
    const performSearch = async () => {
      if (!query.trim()) {
        setResults([]);
        setTotal(0);
        return;
      }

      try {
        setIsLoading(true);
        setError(null);
        const response = await usersAPI.search(query, limit, offset);
        setResults(response.results);
        setTotal(response.total);
      } catch (err) {
        const message =
          err instanceof Error ? err.message : "Failed to search users";
        setError(message);
        console.error("Search error:", err);
      } finally {
        setIsLoading(false);
      }
    };

    performSearch();
  }, [query, offset]);

  const handleLoadMore = () => {
    setOffset((prev) => prev + limit);
  };

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center gap-3 border-b border-white/15 pb-3">
        <button
          onClick={() => navigate("/")}
          className="flex h-9 w-9 cursor-pointer items-center justify-center rounded-none text-white/60 transition hover:bg-white/10 hover:text-white"
          aria-label="Go back"
        >
          <ChevronLeft size={20} />
        </button>
        <div>
          <h1 className="text-[20px] font-medium text-white">Search results</h1>
          {query && (
            <p className="text-[13px] text-white/60">
              Results for:{" "}
              <span className="font-medium text-white">{query}</span>
            </p>
          )}
        </div>
      </div>

      {error && (
        <div className="rounded-none border border-[#ea4335]/30 bg-[#fce8e6] px-4 py-3 text-[13px] text-[#c5221f]">
          {error}
        </div>
      )}

      {!query.trim() ? (
        <div className="rounded-none border border-white/15 bg-white/5 px-6 py-16 text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-none bg-[#1a73e8]/20">
            <Search className="h-7 w-7 text-[#1a73e8]" />
          </div>
          <p className="text-[15px] font-medium text-white">
            Search for people
          </p>
          <p className="mt-1 text-[13px] text-white/60">
            Enter a search query to find users
          </p>
        </div>
      ) : isLoading && results.length === 0 ? (
        <div>
          {[0, 1, 2, 3].map((i) => (
            <div key={i} className="border-b border-white/15 bg-white/5 p-5">
              <div className="flex items-center gap-3">
                <div className="h-11 w-11 animate-pulse rounded-none bg-white/15" />
                <div className="space-y-2 flex-1">
                  <div className="h-3 w-24 animate-pulse rounded bg-white/15" />
                  <div className="h-2.5 w-16 animate-pulse rounded bg-white/10" />
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : results.length === 0 ? (
        <div className="rounded-none border border-white/15 bg-white/5 px-6 py-16 text-center">
          <p className="text-[15px] font-medium text-white">No results</p>
          <p className="mt-1 text-[13px] text-white/60">
            No users found matching "{query}"
          </p>
        </div>
      ) : (
        <>
          <div>
            {results.map((user) => (
              <div
                key={user.id}
                className="flex items-center justify-between border-b border-white/15 bg-white/5 p-4 transition hover:bg-white/[0.07]"
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-11 w-11 items-center justify-center rounded-none bg-[#1a73e8]/20 text-[13px] font-medium text-[#1a73e8]">
                    {user.firstName[0]}
                    {user.lastName[0]}
                  </div>
                  <div>
                    <p className="flex items-center gap-2 text-[14px] font-medium text-white">
                      {user.firstName} {user.lastName}
                      <ProBadge isPro={user.plan === "PRO"} />
                    </p>
                    <p className="text-[12px] text-white/60">
                      @{user.username}
                    </p>
                  </div>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => navigate(`/users/${user.id}`)}
                  disabled={currentUser?.id === user.id}
                  className="rounded-none border-white/20 bg-transparent text-white/85 hover:bg-white/10 hover:text-white"
                >
                  {currentUser?.id === user.id ? "You" : "View"}
                </Button>
              </div>
            ))}
          </div>

          <div className="flex flex-wrap items-center justify-between gap-2">
            <p className="text-[13px] text-white/60">
              Showing {results.length} of {total} results
            </p>
            {offset + limit < total && (
              <button
                onClick={handleLoadMore}
                disabled={isLoading}
                className="text-[13px] font-medium text-[#1a73e8] hover:underline disabled:opacity-50 cursor-pointer"
              >
                {isLoading ? "Loading..." : "Load more"}
              </button>
            )}
          </div>
        </>
      )}
    </div>
  );
}
