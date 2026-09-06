'use client'

import { useState } from 'react'
import {
  BarChart3,
  Boxes,
  Check,
  ChevronsUpDown,
  LayoutTemplate,
  Package,
  PhoneCall,
  RefreshCw,
  Mountain,
} from 'lucide-react'
import { cn } from '@/lib/utils'

const tenants = [
  { id: 'matriz', name: 'Basecamp Matriz', short: 'BM' },
  { id: 'parapentitis', name: 'Parapentitis', short: 'PP' },
  { id: 'fisiozom', name: 'Fisiozom', short: 'FZ' },
]

const navItems = [
  { label: 'Analytics', icon: BarChart3, active: true },
  { label: 'Products', icon: Package },
  { label: 'AI Voicebot Logs', icon: PhoneCall },
  { label: 'Inventory Sync', icon: RefreshCw, hint: 'SICAR / Mercado Libre' },
  { label: 'Template Selector', icon: LayoutTemplate },
]

export function Sidebar() {
  const [activeTenant, setActiveTenant] = useState(tenants[0])
  const [open, setOpen] = useState(false)

  return (
    <aside className="flex h-full w-64 shrink-0 flex-col border-r border-border bg-sidebar">
      {/* Brand */}
      <div className="flex items-center gap-2.5 border-b border-border px-5 py-4">
        <div className="flex size-9 items-center justify-center rounded-lg bg-primary/15 ring-1 ring-primary/30">
          <Mountain className="size-5 text-primary" />
        </div>
        <div className="leading-tight">
          <p className="text-sm font-semibold text-foreground">Basecamp 420</p>
          <p className="text-[11px] text-muted-foreground">Multi-tenant platform</p>
        </div>
      </div>

      {/* Tenant switcher */}
      <div className="relative px-3 py-3">
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          aria-haspopup="listbox"
          aria-expanded={open}
          className="flex w-full items-center gap-2.5 rounded-lg border border-border bg-secondary px-3 py-2.5 text-left transition-colors hover:border-primary/40"
        >
          <span className="flex size-7 items-center justify-center rounded-md bg-primary/15 text-[11px] font-semibold text-primary ring-1 ring-primary/30">
            {activeTenant.short}
          </span>
          <span className="flex-1 truncate text-sm font-medium text-foreground">
            {activeTenant.name}
          </span>
          <ChevronsUpDown className="size-4 text-muted-foreground" />
        </button>

        {open && (
          <ul
            role="listbox"
            className="absolute inset-x-3 z-20 mt-1.5 overflow-hidden rounded-lg border border-border bg-popover p-1 shadow-xl shadow-black/40"
          >
            {tenants.map((t) => {
              const selected = t.id === activeTenant.id
              return (
                <li key={t.id} role="option" aria-selected={selected}>
                  <button
                    type="button"
                    onClick={() => {
                      setActiveTenant(t)
                      setOpen(false)
                    }}
                    className={cn(
                      'flex w-full items-center gap-2.5 rounded-md px-2.5 py-2 text-left text-sm transition-colors hover:bg-secondary',
                      selected ? 'text-foreground' : 'text-muted-foreground',
                    )}
                  >
                    <span className="flex size-6 items-center justify-center rounded-md bg-secondary text-[10px] font-semibold text-primary">
                      {t.short}
                    </span>
                    <span className="flex-1 truncate">{t.name}</span>
                    {selected && <Check className="size-4 text-primary" />}
                  </button>
                </li>
              )
            })}
          </ul>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-1 px-3 py-2">
        <p className="px-2.5 pb-1.5 text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
          Workspace
        </p>
        {navItems.map((item) => {
          const Icon = item.icon
          return (
            <a
              key={item.label}
              href="#"
              aria-current={item.active ? 'page' : undefined}
              className={cn(
                'group flex items-center gap-3 rounded-lg px-2.5 py-2 text-sm transition-colors',
                item.active
                  ? 'bg-primary/10 text-foreground ring-1 ring-primary/25'
                  : 'text-muted-foreground hover:bg-secondary hover:text-foreground',
              )}
            >
              <Icon
                className={cn(
                  'size-4 shrink-0',
                  item.active ? 'text-primary' : 'text-muted-foreground group-hover:text-foreground',
                )}
              />
              <span className="flex-1 truncate">{item.label}</span>
              {item.hint && (
                <span className="rounded bg-secondary px-1.5 py-0.5 text-[9px] font-medium uppercase tracking-wide text-muted-foreground">
                  {item.hint}
                </span>
              )}
            </a>
          )
        })}
      </nav>

      {/* Footer */}
      <div className="border-t border-border px-3 py-3">
        <div className="flex items-center gap-2.5 rounded-lg bg-secondary px-3 py-2.5">
          <Boxes className="size-4 text-primary" />
          <div className="leading-tight">
            <p className="text-xs font-medium text-foreground">Pro Plan</p>
            <p className="text-[11px] text-muted-foreground">3 / 5 tenants used</p>
          </div>
        </div>
      </div>
    </aside>
  )
}
