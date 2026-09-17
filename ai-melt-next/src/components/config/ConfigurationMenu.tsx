'use client'

import {
  useEffect,
  useRef,
  useState,
} from 'react'
import {
  ChevronDown,
  Settings2,
} from 'lucide-react'

import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

export type ConfigurationMenuItem = {
  key: string
  label: string
  onSelect: () => void
  disabled?: boolean
}

interface Props {
  label: string
  items: ConfigurationMenuItem[]
  disabled?: boolean
}

export function ConfigurationMenu({
  label,
  items,
  disabled = false,
}: Props) {
  const [open, setOpen] = useState(false)
  const containerRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    if (!open) return

    const handlePointerDown = (event: MouseEvent) => {
      const target = event.target as Node

      if (
        containerRef.current &&
        !containerRef.current.contains(target)
      ) {
        setOpen(false)
      }
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setOpen(false)
      }
    }

    document.addEventListener(
      'mousedown',
      handlePointerDown,
    )
    document.addEventListener(
      'keydown',
      handleKeyDown,
    )

    return () => {
      document.removeEventListener(
        'mousedown',
        handlePointerDown,
      )
      document.removeEventListener(
        'keydown',
        handleKeyDown,
      )
    }
  }, [open])

  return (
    <div
      ref={containerRef}
      className="relative"
    >
      <Button
        variant="outline"
        onClick={() => setOpen((value) => !value)}
        disabled={disabled}
        aria-haspopup="menu"
        aria-expanded={open}
      >
        <Settings2 size={16} />
        {label}
        <ChevronDown
          size={15}
          className={cn(
            'transition-transform',
            open && 'rotate-180',
          )}
        />
      </Button>

      {open && (
        <div
          role="menu"
          className="absolute right-0 z-40 mt-2 min-w-64 overflow-hidden rounded-xl border border-gray-200 bg-white p-1.5 shadow-lg"
        >
          {items.map((item) => (
            <button
              key={item.key}
              type="button"
              role="menuitem"
              disabled={item.disabled}
              onClick={() => {
                if (item.disabled) return

                setOpen(false)
                item.onSelect()
              }}
              className={cn(
                'flex w-full items-center rounded-lg px-3 py-2.5 text-left text-sm font-medium transition-colors',
                item.disabled
                  ? 'cursor-not-allowed text-gray-300'
                  : 'text-gray-700 hover:bg-blue-50 hover:text-blue-700',
              )}
            >
              {item.label}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
