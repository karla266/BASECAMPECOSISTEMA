'use client'

import { Bell, Search, Sparkles } from 'lucide-react'
import PointTerminalSelector from '@/components/PointTerminalSelector'

export function Topbar() {
  return (
    <header className="flex h-16 shrink-0 items-center gap-4 border-b border-border bg-background/60 px-6 backdrop-blur">
      <div>
        <h1 className="text-sm font-semibold text-foreground">Analytics</h1>
        <p className="text-[11px] text-muted-foreground">Basecamp Matriz · Overview</p>
      </div>

      {/* Search */}
      <div className="ml-4 hidden flex-1 items-center md:flex">
        <div className="flex w-full max-w-sm items-center gap-2 rounded-lg border border-border bg-secondary px-3 py-2">
          <Search className="size-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search products, logs, leads..."
            className="w-full bg-transparent text-sm text-foreground placeholder:text-muted-foreground focus:outline-none"
          />
        </div>
      </div>

      <div className="ml-auto flex items-center gap-3">
        <PointTerminalSelector />
        {/* AI status badge */}
        <span className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-3 py-1.5 text-xs font-medium text-primary">
          <span className="relative flex size-2">
            <span className="absolute inline-flex size-full animate-ping rounded-full bg-primary opacity-60" />
            <span className="relative inline-flex size-2 rounded-full bg-primary" />
          </span>
          <Sparkles className="size-3.5" />
          AI Voicebot Online
        </span>

        <button
          type="button"
          aria-label="Notifications"
          className="relative flex size-9 items-center justify-center rounded-lg border border-border bg-secondary text-muted-foreground transition-colors hover:text-foreground"
        >
          <Bell className="size-4" />
          <span className="absolute right-2 top-2 size-1.5 rounded-full bg-primary" />
        </button>

        {/* User profile */}
        <button
          type="button"
          className="flex items-center gap-2.5 rounded-lg border border-border bg-secondary py-1.5 pl-1.5 pr-3 transition-colors hover:border-primary/40"
        >
          <span className="flex size-7 items-center justify-center rounded-md bg-primary text-xs font-bold text-primary-foreground">
            AR
          </span>
          <span className="hidden text-left leading-tight sm:block">
            <span className="block text-xs font-medium text-foreground">Ana Reyes</span>
            <span className="block text-[11px] text-muted-foreground">Platform Admin</span>
          </span>
        </button>
      </div>
    </header>
  )
}
