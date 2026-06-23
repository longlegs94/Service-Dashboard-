import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Menu, Search, Plus, Bell, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface TopBarProps {
  onOpenMenu: () => void;
}

export function TopBar({ onOpenMenu }: TopBarProps) {
  const navigate = useNavigate();
  const [query, setQuery] = useState("");

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    const q = query.trim();
    if (q) navigate(`/app/search?q=${encodeURIComponent(q)}`);
  }

  return (
    <header className="sticky top-0 z-30 flex items-center gap-2 border-b bg-background/95 px-4 py-3 backdrop-blur supports-[backdrop-filter]:bg-background/80 md:gap-4 md:px-6">
      {/* Mobile hamburger */}
      <button
        aria-label="Open menu"
        onClick={onOpenMenu}
        className="rounded-md p-2 text-muted-foreground hover:bg-accent md:hidden"
      >
        <Menu className="h-5 w-5" />
      </button>

      {/* Search */}
      <form onSubmit={handleSearch} className="relative flex-1 md:max-w-md">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search jobs and clients…"
          aria-label="Search"
          className="h-10 pl-9"
        />
      </form>

      <div className="flex items-center gap-1 md:gap-2">
        {/* New Job */}
        <Button asChild size="sm" className="h-10">
          <Link to="/app/jobs/new">
            <Plus className="h-4 w-4" />
            <span className="hidden sm:inline">New Job</span>
          </Link>
        </Button>

        {/* Notifications */}
        <Button
          variant="ghost"
          size="icon"
          className="h-10 w-10 text-muted-foreground"
          aria-label="Notifications"
        >
          <Bell className="h-5 w-5" />
        </Button>

        {/* Settings */}
        <Button
          asChild
          variant="ghost"
          size="icon"
          className="h-10 w-10 text-muted-foreground"
        >
          <Link to="/app/settings" aria-label="Settings">
            <Settings className="h-5 w-5" />
          </Link>
        </Button>
      </div>
    </header>
  );
}
