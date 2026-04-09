import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function levelStatusLabel(status: string): string {
  return status.replace(/_/g, ' ')
}

export function docTypeLabel(type: string | undefined): string {
  if (!type) return '—'
  return type.replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, (c) => c.toUpperCase())
}
