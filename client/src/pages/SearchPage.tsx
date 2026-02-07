import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { motion } from "framer-motion";
import { usersAPI, type User } from "../services/api";
import { useAuth } from "../context/AuthContext";
import { ChevronLeft } from "lucide-react";

export function SearchPage() {
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
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.2, ease: "easeOut" }}
      className="min-h-screen bg-neutral-bg"
    >
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 space-y-6">
        {/* Header with back button */}
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate("/")}
            className="p-2 hover:bg-neutral-100 rounded-lg transition-colors"
            aria-label="Go back"
          >
            <ChevronLeft size={20} className="text-neutral-600" />
          </button>
          <div>
            <h1 className="text-brand text-xl font-bold">Search Results</h1>
            {query && (
              <p className="text-sm text-muted">
                Results for:{" "}
                <span className="font-medium text-brand">{query}</span>
              </p>
            )}
          </div>
        </div>

        <div className="card p-6">
          {error && (
            <div className="mb-4 rounded-lg bg-red-50 border border-red-200 p-3 text-sm text-red-700">
              {error}
            </div>
          )}

          {!query.trim() ? (
            <div className="text-center py-12">
              <p className="text-muted">Enter a search query to find users</p>
            </div>
          ) : isLoading && results.length === 0 ? (
            <div className="text-muted">Searching for users...</div>
          ) : results.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-muted">No users found matching "{query}"</p>
            </div>
          ) : (
            <>
              <div className="space-y-3">
                {results.map((user) => (
                  <motion.div
                    key={user.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.2 }}
                    className="flex items-center justify-between rounded-lg border border-neutral-100 p-4 hover:border-brand-500 hover:bg-brand-50 transition-colors"
                  >
                    <div className="flex items-center gap-4 flex-1">
                      <div className="w-12 h-12 rounded-full bg-gradient-to-br from-accent-500 to-accent-600 flex items-center justify-center text-white font-bold">
                        {user.firstName[0]}
                        {user.lastName[0]}
                      </div>
                      <div>
                        <div className="text-sm font-medium text-brand">
                          {user.firstName} {user.lastName}
                        </div>
                        <div className="text-xs text-muted">
                          @{user.username}
                        </div>
                      </div>
                    </div>
                    <button
                      onClick={() => navigate(`/users/${user.id}`)}
                      disabled={currentUser?.id === user.id}
                      className="btn-primary px-4 py-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {currentUser?.id === user.id ? "You" : "View Profile"}
                    </button>
                  </motion.div>
                ))}
              </div>

              {/* Show total results count and load more button */}
              <div className="mt-6 flex items-center justify-between">
                <p className="text-sm text-muted">
                  Showing {results.length} of {total} results
                </p>
                {offset + limit < total && (
                  <button
                    onClick={handleLoadMore}
                    disabled={isLoading}
                    className="btn-secondary px-4 py-2"
                  >
                    {isLoading ? "Loading..." : "Load More"}
                  </button>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </motion.div>
  );
}
