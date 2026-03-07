interface CharacterCounterProps {
  current: number;
  limit: number;
  className?: string;
}

export function CharacterCounter({
  current,
  limit,
  className = "",
}: CharacterCounterProps) {
  const progressPercent = Math.min((current / limit) * 100, 100);
  const isOverLimit = current > limit;

  return (
    <div className={className}>
      <div className="h-1 w-full overflow-hidden rounded-full bg-border">
        <div
          className={`h-full transition-all duration-base ${
            isOverLimit ? "bg-danger" : "bg-accent"
          }`}
          style={{ width: `${progressPercent}%` }}
        />
      </div>
      <p
        className={`mt-1 text-[11px] ${
          isOverLimit ? "text-red-400" : "text-text-muted"
        }`}
      >
        {current}/{limit} characters
      </p>
    </div>
  );
}
