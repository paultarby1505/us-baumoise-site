export function HouseIcon({ className = "h-4 w-4" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
      <path d="M12 3 2 12h3v8h6v-5h2v5h6v-8h3L12 3z" />
    </svg>
  );
}

export function BusIcon({ className = "h-4 w-4" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
      <path d="M4 5a2 2 0 0 0-2 2v9h2a2 2 0 1 0 4 0h8a2 2 0 1 0 4 0h2V9a2 2 0 0 0-2-2H4zm0 2h16v4H4V7zm1 9a1 1 0 1 1 0 2 1 1 0 0 1 0-2zm14 0a1 1 0 1 1 0 2 1 1 0 0 1 0-2z" />
    </svg>
  );
}
