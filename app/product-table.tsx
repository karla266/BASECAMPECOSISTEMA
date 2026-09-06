'use client'

import { RefreshCw, Search, Sparkles } from 'lucide-react'
import { cn } from '@/lib/utils'

type SyncState = 'synced' | 'pending' | 'error'

const products: {
  name: string
  sku: string
  price: string
  stock: number
  channel: string
  seo: number
  sync: SyncState
}[] = [
  { name: 'Tandem Paragliding Flight', sku: 'PP-TAND-01', price: '$189.00', stock: 42, channel: 'Mercado Libre', seo: 92, sync: 'synced' },
  { name: 'Sports Physio Session (60m)', sku: 'FZ-PHYS-60', price: '$54.00', stock: 18, channel: 'SICAR', seo: 74, sync: 'pending' },
  { name: 'Adventure Helmet Pro', sku: 'BM-HELM-09', price: '$129.00', stock: 7, channel: 'Mercado Libre', seo: 61, sync: 'error' },
  { name: 'Recovery Massage Package', sku: 'FZ-MASS-05', price: '$220.00', stock: 25, channel: 'SICAR', seo: 88, sync: 'synced' },
  { name: 'Beginner Flight Course', sku: 'PP-CRSE-03', price: '$640.00', stock: 12, channel: 'Mercado Libre', seo: 45, sync: 'pending' },
]

const syncStyles: Record<SyncState, string> = {
  synced: 'bg-primary/10 text-primary ring-primary/25',
  pending: 'bg-amber-500/10 text-amber-400 ring-amber-500/25',
  error: 'bg-destructive/10 text-destructive ring-destructive/25',
}

const syncLabel: Record<SyncState, string> = {
  synced: 'Synced',
  pending: 'Pending',
  error: 'Error',
}

function SeoBar({ score }: { score: number }) {
  return (
    <div className="flex items-center gap-2">
      <div className="h-1.5 w-16 overflow-hidden rounded-full bg-secondary">
        <div
          className={cn(
            'h-full rounded-full',
            score >= 80 ? 'bg-primary' : score >= 60 ? 'bg-amber-400' : 'bg-destructive',
          )}
          style={{ width: `${score}%` }}
        />
      </div>
      <span className="text-xs tabular-nums text-muted-foreground">{score}</span>
    </div>
  )
}

export function ProductTable() {
  return (
    <section className="rounded-xl border border-border bg-card">
      {/* Header */}
      <div className="flex flex-col gap-3 border-b border-border px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-sm font-semibold text-foreground">Product Management</h2>
          <p className="text-[11px] text-muted-foreground">
            Optimize listings and sync stock across channels
          </p>
        </div>
        <div className="flex items-center gap-2 rounded-lg border border-border bg-secondary px-3 py-2 sm:w-64">
          <Search className="size-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Filter products..."
            className="w-full bg-transparent text-sm text-foreground placeholder:text-muted-foreground focus:outline-none"
          />
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full min-w-[820px] border-collapse text-left">
          <thead>
            <tr className="border-b border-border text-[11px] uppercase tracking-wider text-muted-foreground">
              <th className="px-5 py-3 font-medium">Product</th>
              <th className="px-5 py-3 font-medium">Price</th>
              <th className="px-5 py-3 font-medium">Stock</th>
              <th className="px-5 py-3 font-medium">Channel</th>
              <th className="px-5 py-3 font-medium">SEO Score</th>
              <th className="px-5 py-3 font-medium">Sync</th>
              <th className="px-5 py-3 text-right font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            {products.map((p) => (
              <tr
                key={p.sku}
                className="border-b border-border/70 transition-colors last:border-0 hover:bg-secondary/40"
              >
                <td className="px-5 py-3.5">
                  <p className="text-sm font-medium text-foreground">{p.name}</p>
                  <p className="font-mono text-[11px] text-muted-foreground">{p.sku}</p>
                </td>
                <td className="px-5 py-3.5 text-sm tabular-nums text-foreground">{p.price}</td>
                <td className="px-5 py-3.5">
                  <span
                    className={cn(
                      'text-sm tabular-nums',
                      p.stock <= 10 ? 'text-destructive' : 'text-foreground',
                    )}
                  >
                    {p.stock}
                  </span>
                </td>
                <td className="px-5 py-3.5">
                  <span className="text-xs text-muted-foreground">{p.channel}</span>
                </td>
                <td className="px-5 py-3.5">
                  <SeoBar score={p.seo} />
                </td>
                <td className="px-5 py-3.5">
                  <span
                    className={cn(
                      'inline-flex items-center rounded-md px-2 py-0.5 text-[11px] font-medium ring-1',
                      syncStyles[p.sync],
                    )}
                  >
                    {syncLabel[p.sync]}
                  </span>
                </td>
                <td className="px-5 py-3.5">
                  <div className="flex items-center justify-end gap-2">
                    <button
                      type="button"
                      className="inline-flex items-center gap-1.5 rounded-md border border-primary/30 bg-primary/10 px-2.5 py-1.5 text-[11px] font-medium text-primary transition-colors hover:bg-primary/20"
                    >
                      <Sparkles className="size-3.5" />
                      AI SEO Optimization
                    </button>
                    <button
                      type="button"
                      className="inline-flex items-center gap-1.5 rounded-md border border-border bg-secondary px-2.5 py-1.5 text-[11px] font-medium text-foreground transition-colors hover:border-primary/40"
                    >
                      <RefreshCw className="size-3.5" />
                      Sync Stock
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  )
}
