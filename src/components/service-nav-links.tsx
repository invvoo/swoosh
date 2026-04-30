import Link from 'next/link'
import { FileText, Mic, Stamp } from 'lucide-react'

const SERVICES = [
  { href: '/translation', icon: FileText, label: 'Document Translation Quote', color: 'text-blue-600' },
  { href: '/interpretation', icon: Mic, label: 'Book an Interpreter', color: 'text-purple-600' },
  { href: '/notary', icon: Stamp, label: 'Notary / Apostille', color: 'text-emerald-600' },
]

interface ServiceNavLinksProps {
  current: 'translation' | 'interpretation' | 'notary'
}

export function ServiceNavLinks({ current }: ServiceNavLinksProps) {
  const others = SERVICES.filter((s) => !s.href.includes(current))
  return (
    <div className="bg-gray-50 border border-gray-200 rounded-lg px-4 py-3 mt-6">
      <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">Looking for something else?</p>
      <div className="flex flex-wrap gap-3">
        {others.map(({ href, icon: Icon, label, color }) => (
          <Link key={href} href={href}
            className={`flex items-center gap-1.5 text-sm font-medium ${color} hover:underline`}>
            <Icon className="h-3.5 w-3.5" />
            {label}
          </Link>
        ))}
      </div>
    </div>
  )
}
