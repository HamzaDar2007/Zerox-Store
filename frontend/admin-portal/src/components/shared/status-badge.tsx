import { Badge } from '@/components/ui/badge'

const statusConfig: Record<string, { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline' | 'success' | 'warning' }> = {
  active: { label: 'Active', variant: 'success' },
  inactive: { label: 'Inactive', variant: 'secondary' },
  pending: { label: 'Pending', variant: 'warning' },
  approved: { label: 'Approved', variant: 'success' },
  rejected: { label: 'Rejected', variant: 'destructive' },
  suspended: { label: 'Suspended', variant: 'destructive' },
  completed: { label: 'Completed', variant: 'success' },
  cancelled: { label: 'Cancelled', variant: 'destructive' },
  refunded: { label: 'Refunded', variant: 'warning' },
  processing: { label: 'Processing', variant: 'default' },
  shipped: { label: 'Shipped', variant: 'default' },
  delivered: { label: 'Delivered', variant: 'success' },
  returned: { label: 'Returned', variant: 'warning' },
  confirmed: { label: 'Confirmed', variant: 'success' },
  paid: { label: 'Paid', variant: 'success' },
  failed: { label: 'Failed', variant: 'destructive' },
  draft: { label: 'Draft', variant: 'secondary' },
  published: { label: 'Published', variant: 'success' },
  archived: { label: 'Archived', variant: 'secondary' },
  open: { label: 'Open', variant: 'default' },
  closed: { label: 'Closed', variant: 'secondary' },
  resolved: { label: 'Resolved', variant: 'success' },
  in_transit: { label: 'In Transit', variant: 'default' },
  trialing: { label: 'Trialing', variant: 'warning' },
  past_due: { label: 'Past Due', variant: 'destructive' },
}

export function StatusBadge({ status }: { status: string | undefined | null }) {
  const s = status ?? 'unknown'
  const config = statusConfig[s.toLowerCase()] ?? {
    label: s.charAt(0).toUpperCase() + s.slice(1),
    variant: 'outline' as const,
  }
  return <Badge variant={config.variant}>{config.label}</Badge>
}
