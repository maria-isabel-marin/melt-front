import { cn } from '@/lib/utils'
import type { LevelStatus, ItemStatus } from '@/types'

const levelColors: Record<LevelStatus, string> = {
  PENDING: 'bg-gray-100 text-gray-600',
  PROCESSING: 'bg-orange-50 text-orange-700',
  PENDING_REVIEW: 'bg-blue-50 text-blue-700',
  APPROVED: 'bg-green-50 text-green-700',
  OUTDATED: 'bg-red-50 text-red-700',
}

const itemColors: Record<ItemStatus, string> = {
  PENDING_REVIEW: 'bg-blue-50 text-blue-700',
  APPROVED: 'bg-green-50 text-green-700',
  REJECTED: 'bg-red-50 text-red-700',
  MODIFIED: 'bg-amber-50 text-amber-700',
}

export function LevelBadge({ status }: { status: LevelStatus }) {
  return (
    <span className={cn(
      'inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold uppercase tracking-wide',
      levelColors[status]
    )}>
      {status.replace(/_/g, ' ')}
    </span>
  )
}

export function ItemBadge({ status }: { status: ItemStatus }) {
  return (
    <span className={cn(
      'inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold uppercase tracking-wide',
      itemColors[status]
    )}>
      {status.replace(/_/g, ' ')}
    </span>
  )
}

export function Badge({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <span className={cn('inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-700', className)}>
      {children}
    </span>
  )
}

import React from 'react'
