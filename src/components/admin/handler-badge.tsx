import { cn } from '@/lib/utils'
import { getHandlerColor, getHandlerInitials } from '@/lib/handler-colors'

interface Props {
  id: string
  name: string
  size?: 'sm' | 'md' | 'lg'
  showName?: boolean
}

export function HandlerBadge({ id, name, size = 'sm', showName = false }: Props) {
  const color = getHandlerColor(id)
  const initials = getHandlerInitials(name)
  const sizeClass = size === 'lg' ? 'h-9 w-9 text-sm' : size === 'md' ? 'h-7 w-7 text-xs' : 'h-6 w-6 text-xs'

  return (
    <span className="inline-flex items-center gap-1.5">
      <span
        className={cn('inline-flex items-center justify-center rounded-full font-semibold shrink-0', color.bg, color.text, sizeClass)}
        title={name}
      >
        {initials}
      </span>
      {showName && <span className="text-sm text-gray-700">{name}</span>}
    </span>
  )
}
