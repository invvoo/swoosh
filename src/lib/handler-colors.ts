const COLORS = [
  { bg: 'bg-violet-500', text: 'text-white', ring: 'ring-violet-300', row: 'border-l-violet-400' },
  { bg: 'bg-blue-500',   text: 'text-white', ring: 'ring-blue-300',   row: 'border-l-blue-400'   },
  { bg: 'bg-teal-500',   text: 'text-white', ring: 'ring-teal-300',   row: 'border-l-teal-400'   },
  { bg: 'bg-amber-500',  text: 'text-white', ring: 'ring-amber-300',  row: 'border-l-amber-400'  },
  { bg: 'bg-rose-500',   text: 'text-white', ring: 'ring-rose-300',   row: 'border-l-rose-400'   },
  { bg: 'bg-emerald-500',text: 'text-white', ring: 'ring-emerald-300',row: 'border-l-emerald-400'},
  { bg: 'bg-orange-500', text: 'text-white', ring: 'ring-orange-300', row: 'border-l-orange-400' },
  { bg: 'bg-cyan-600',   text: 'text-white', ring: 'ring-cyan-300',   row: 'border-l-cyan-500'   },
]

export function getHandlerColor(id: string) {
  let hash = 0
  for (let i = 0; i < id.length; i++) {
    hash = (hash * 31 + id.charCodeAt(i)) & 0xffff
  }
  return COLORS[hash % COLORS.length]
}

export function getHandlerInitials(name: string): string {
  return name
    .split(' ')
    .map((w) => w[0])
    .slice(0, 2)
    .join('')
    .toUpperCase()
}
