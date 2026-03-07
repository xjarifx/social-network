import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { usersAPI, type User } from "../services/api";
import { useAuth } from "../context/auth-context";
import { Search } from "lucide-react";
import {
  PageHeader,
  LoadingSkeleton,
  EmptyState,
  UserCard,
  ErrorMessage,
} from "../components";

export default function SearchPage() {
  const navigate = useNavigate();
  const { user: currentUser } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const query = searchParams.get("q") || "";

  const [results, setResults] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [total, setTotal] = useState(0);
  const [offset, setOffset] = useState(0);
  const [searchInput, setSearchInput] = useState(query);
  const limit = 20;

  useEffect(() => {
    setSearchInput(query);
    setOffset(0);
  }, [query]);

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

  const handleSearchSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const nextQuery = searchInput.trim();
    setOffset(0);
    if (!nextQuery) {
      setSearchParams({});
      return;
    }
    setSearchParams({ q: nextQuery });
  };

  return (
    <div>
      <PageHeader
        title="Search results"
        subtitle={query ? `Results for: ${query}` : undefined}
        showBackButton
        backPath="/"
      />

      <form
        onSubmit={handleSearchSubmit}
        className="flex items-center gap-3 border-b-2 border-border bg-surface-hover px-4 py-3 transition-all duration-150 focus-within:border-accent"
      >
        <Search className="h-5 w-5 text-text-secondary" />
        <input
          type="text"
          value={searchInput}
          onChange={(event) => setSearchInput(event.target.value)}
          placeholder="Search users"
          className="w-full bg-transparent text-base text-text-primary outline-none placeholder:text-text-muted"
        />
      </form>

      {error && <ErrorMessage message={error} />}

      {!query.trim() ? (
        <EmptyState
          icon={Search}
          title="Search for people"
          description="Enter a search query to find users"
          iconClassName="text-[#1a73e8]"
        />
      ) : isLoading && results.length === 0 ? (
        <LoadingSkeleton variant="user" count={4} />
      ) : results.length === 0 ? (
        <EmptyState
          icon={Search}
          title="No results"
          description={`No users found matching "${query}"`}
        />
      ) : (
        <>
          <div>
            {results.map((user) => (
              <UserCard
                key={user.id}
                user={user}
                currentUserId={currentUser?.id}
                action={{
                  label: "View",
                  onClick: () => navigate(`/users/${user.id}`),
                  variant: "outline",
                }}
              />
            ))}
          </div>

          <div className="flex flex-wrap items-center justify-between gap-2 p-4">
            <p className="text-[13px] text-white/60">
              Showing {results.length} of {total} results
            </p>
            {offset + limit < total && (
              <button
                onClick={handleLoadMore}
                disabled={isLoading}
                className="cursor-pointer text-[13px] font-medium text-[#1a73e8] hover:underline disabled:opacity-50"
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
