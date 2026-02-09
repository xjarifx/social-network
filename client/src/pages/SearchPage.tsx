import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { usersAPI, type User } from "../services/api";
import { useAuth } from "../context/AuthContext";
import { ChevronLeft, Search } from "lucide-react";
import { Button } from "../components/ui/button";

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
      <div className="flex items-center gap-3">
        <button
          onClick={() => navigate("/")}
          className="flex h-9 w-9 items-center justify-center rounded-xl text-[#5f6368] hover:bg-[#f1f3f4] cursor-pointer transition"
          aria-label="Go back"
        >
          <ChevronLeft size={20} />
        </button>
        <div>
          <h1 className="text-[20px] font-medium text-[#202124]">
            Search results
          </h1>
          {query && (
            <p className="text-[13px] text-[#5f6368]">
              Results for:{" "}
              <span className="font-medium text-[#202124]">{query}</span>
            </p>
          )}
        </div>
      </div>

      {error && (
        <div className="rounded-xl border border-[#ea4335]/30 bg-[#fce8e6] px-4 py-3 text-[13px] text-[#c5221f]">
          {error}
        </div>
      )}

      {!query.trim() ? (
        <div className="rounded-2xl bg-white px-6 py-16 text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-[#e8f0fe]">
            <Search className="h-7 w-7 text-[#1a73e8]" />
          </div>
          <p className="text-[15px] font-medium text-[#202124]">
            Search for people
          </p>
          <p className="mt-1 text-[13px] text-[#5f6368]">
            Enter a search query to find users
          </p>
        </div>
      ) : isLoading && results.length === 0 ? (
        <div className="grid gap-3 sm:grid-cols-2">
          {[0, 1, 2, 3].map((i) => (
            <div key={i} className="rounded-2xl bg-white p-5">
              <div className="flex items-center gap-3">
                <div className="h-11 w-11 rounded-2xl bg-[#f1f3f4] animate-pulse" />
                <div className="space-y-2 flex-1">
                  <div className="h-3 w-24 rounded bg-[#f1f3f4] animate-pulse" />
                  <div className="h-2.5 w-16 rounded bg-[#f1f3f4] animate-pulse" />
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : results.length === 0 ? (
        <div className="rounded-2xl bg-white px-6 py-16 text-center">
          <p className="text-[15px] font-medium text-[#202124]">No results</p>
          <p className="mt-1 text-[13px] text-[#5f6368]">
            No users found matching "{query}"
          </p>
        </div>
      ) : (
        <>
          <div className="grid gap-3 sm:grid-cols-2">
            {results.map((user) => (
              <div
                key={user.id}
                className="flex items-center justify-between rounded-2xl bg-white p-4 transition-shadow hover:shadow-[0_1px_3px_0_rgba(60,64,67,.3),0_4px_8px_3px_rgba(60,64,67,.15)]"
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#e8f0fe] text-[13px] font-medium text-[#1a73e8]">
                    {user.firstName[0]}
                    {user.lastName[0]}
                  </div>
                  <div>
                    <p className="text-[14px] font-medium text-[#202124]">
                      {user.firstName} {user.lastName}
                    </p>
                    <p className="text-[12px] text-[#5f6368]">
                      @{user.username}
                    </p>
                  </div>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => navigate(`/users/${user.id}`)}
                  disabled={currentUser?.id === user.id}
                  className="rounded-xl"
                >
                  {currentUser?.id === user.id ? "You" : "View"}
                </Button>
              </div>
            ))}
          </div>

          <div className="flex flex-wrap items-center justify-between gap-2">
            <p className="text-[13px] text-[#5f6368]">
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
