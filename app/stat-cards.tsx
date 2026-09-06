import {
  ArrowDownRight,
  ArrowUpRight,
  CreditCard,
  DollarSign,
  PhoneCall,
  RefreshCw,
} from 'lucide-react'
import { cn } from '@/lib/utils'

const stats = [
  {
    label: 'Total Sales',
    value: '$482,910',
    delta: '+12.4%',
    up: true,
    sub: 'vs. last 30 days',
    icon: DollarSign,
  },
  {
    label: 'AI Phone Qualified Leads',
    value: '1,284',
    delta: '+8.1%',
    up: true,
    sub: '342 booked this week',
    icon: PhoneCall,
  },
  {
    label: 'Sync Status',
    value: 'Healthy',
    delta: '2 pending',
    up: false,
    sub: 'SICAR · Mercado Libre',
    icon: RefreshCw,
  },
  {
    label: 'Active Subscription',
    value: 'Pro',
    delta: 'Renews Sep 14',
    up: true,
    sub: '3 of 5 tenants active',
    icon: CreditCard,
  },
]

export function StatCards() {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {stats.map((s) => {
        const Icon = s.icon
        return (
          <div
            key={s.label}
            className="rounded-xl border border-border bg-card p-5 transition-colors hover:border-primary/30"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-muted-foreground">{s.label}</span>
              <span className="flex size-8 items-center justify-center rounded-lg bg-primary/10 text-primary ring-1 ring-primary/20">
                <Icon className="size-4" />
              </span>
            </div>
            <p className="mt-4 text-2xl font-semibold tracking-tight text-foreground">{s.value}</p>
            <div className="mt-2 flex items-center gap-2">
              <span
                className={cn(
                  'inline-flex items-center gap-0.5 rounded-md px-1.5 py-0.5 text-[11px] font-medium',
                  s.up
                    ? 'bg-primary/10 text-primary'
                    : 'bg-secondary text-muted-foreground',
                )}
              >
                {s.up ? (
                  <ArrowUpRight className="size-3" />
                ) : (
                  <ArrowDownRight className="size-3" />
                )}
                {s.delta}
              </span>
              <span className="text-[11px] text-muted-foreground">{s.sub}</span>
            </div>
          </div>
        )
      })}
    </div>
  )
}
