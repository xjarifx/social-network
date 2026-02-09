import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { motion } from "framer-motion";
import { usersAPI, type User } from "../services/api";
import { useAuth } from "../context/AuthContext";
import { ChevronLeft } from "lucide-react";
import { Card, CardContent } from "../components/ui/card";
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
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.2, ease: "easeOut" }}
      className="min-h-screen"
    >
      <div className="mx-auto max-w-4xl px-4 sm:px-6 py-8">
        <div className="space-y-6">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate("/")}
              aria-label="Go back"
            >
              <ChevronLeft size={20} />
            </Button>
            <div>
              <h1 className="text-xl font-semibold">Search results</h1>
              {query && (
                <p className="text-sm text-muted-foreground">
                  Results for: <span className="font-medium">{query}</span>
                </p>
              )}
            </div>
          </div>

          <Card>
            <CardContent className="p-6">
              {error && (
                <div className="mb-4 rounded-2xl border border-destructive/40 bg-destructive/10 p-3 text-sm text-destructive">
                  {error}
                </div>
              )}

              {!query.trim() ? (
                <div className="py-12 text-center text-muted-foreground">
                  Enter a search query to find users
                </div>
              ) : isLoading && results.length === 0 ? (
                <div className="text-sm text-muted-foreground">
                  Searching for users...
                </div>
              ) : results.length === 0 ? (
                <div className="py-12 text-center text-muted-foreground">
                  No users found matching "{query}"
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
                        className="flex items-center justify-between rounded-2xl border border-border/60 bg-muted/30 p-4"
                      >
                        <div className="flex flex-1 items-center gap-4">
                          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-primary/10 text-sm font-semibold text-primary">
                            {user.firstName[0]}
                            {user.lastName[0]}
                          </div>
                          <div>
                            <div className="text-sm font-medium">
                              {user.firstName} {user.lastName}
                            </div>
                            <div className="text-xs text-muted-foreground">
                              @{user.username}
                            </div>
                          </div>
                        </div>
                        <Button
                          onClick={() => navigate(`/users/${user.id}`)}
                          disabled={currentUser?.id === user.id}
                        >
                          {currentUser?.id === user.id ? "You" : "View profile"}
                        </Button>
                      </motion.div>
                    ))}
                  </div>

                  <div className="mt-6 flex flex-wrap items-center justify-between gap-2">
                    <p className="text-sm text-muted-foreground">
                      Showing {results.length} of {total} results
                    </p>
                    {offset + limit < total && (
                      <Button
                        variant="secondary"
                        onClick={handleLoadMore}
                        disabled={isLoading}
                      >
                        {isLoading ? "Loading..." : "Load more"}
                      </Button>
                    )}
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </motion.div>
  );
}
