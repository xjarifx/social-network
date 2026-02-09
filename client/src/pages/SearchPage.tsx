import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { usersAPI, type User } from "../services/api";
import { useAuth } from "../context/AuthContext";
import { ChevronLeft } from "lucide-react";
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
    <div className="py-4">
      <div className="mb-4 flex items-center gap-3">
        <button
          onClick={() => navigate("/")}
          className="rounded-full p-2 text-[#5f6368] hover:bg-[#f1f3f4] cursor-pointer"
          aria-label="Go back"
        >
          <ChevronLeft size={20} />
        </button>
        <div>
          <h1 className="text-[16px] font-medium text-[#202124]">
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

      <div className="rounded-lg border border-[#dadce0] bg-white p-5">
        {error && (
          <div className="mb-4 rounded-lg border border-[#ea4335]/30 bg-[#fce8e6] px-4 py-3 text-[13px] text-[#c5221f]">
            {error}
          </div>
        )}

        {!query.trim() ? (
          <p className="py-8 text-center text-[14px] text-[#5f6368]">
            Enter a search query to find users
          </p>
        ) : isLoading && results.length === 0 ? (
          <p className="text-[13px] text-[#5f6368]">Searching for users...</p>
        ) : results.length === 0 ? (
          <p className="py-8 text-center text-[14px] text-[#5f6368]">
            No users found matching "{query}"
          </p>
        ) : (
          <>
            <div className="divide-y divide-[#e8eaed]">
              {results.map((user) => (
                <div
                  key={user.id}
                  className="flex items-center justify-between py-3"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#e8f0fe] text-[13px] font-medium text-[#1a73e8]">
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
                  >
                    {currentUser?.id === user.id ? "You" : "View profile"}
                  </Button>
                </div>
              ))}
            </div>

            <div className="mt-4 flex flex-wrap items-center justify-between gap-2 border-t border-[#e8eaed] pt-3">
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
    </div>
  );
}
