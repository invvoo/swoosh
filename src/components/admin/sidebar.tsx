'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { cn } from '@/lib/utils'
import {
  LayoutDashboard,
  Briefcase,
  Users,
  Languages,
  Package,
  Receipt,
  Settings,
  LogOut,
  Globe,
} from 'lucide-react'

const navItems = [
  { href: '/admin', label: 'Dashboard', icon: LayoutDashboard, exact: true },
  { href: '/admin/jobs', label: 'Jobs', icon: Briefcase },
  { href: '/admin/clients', label: 'Clients', icon: Users },
  { href: '/admin/translators', label: 'Translators', icon: Languages },
  { href: '/admin/equipment', label: 'Equipment', icon: Package },
  { href: '/admin/invoices', label: 'Invoices / Payouts', icon: Receipt },
  { href: '/admin/settings', label: 'Settings', icon: Settings },
]

export function Sidebar() {
  const pathname = usePathname()
  const router = useRouter()

  async function handleSignOut() {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/admin/login')
    router.refresh()
  }

  return (
    <aside className="w-60 min-h-screen bg-[#1a1a2e] text-white flex flex-col">
      <div className="px-6 py-5 border-b border-white/10">
        <div className="flex items-center gap-2">
          <Globe className="h-5 w-5 text-blue-300" />
          <span className="font-bold text-sm leading-tight">
            LA Translation<br />
            <span className="font-normal text-xs text-white/60">&amp; Interpretation</span>
          </span>
        </div>
      </div>

      <nav className="flex-1 px-3 py-4 space-y-0.5">
        {navItems.map((item) => {
          const isActive = item.exact
            ? pathname === item.href
            : pathname.startsWith(item.href)

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors',
                isActive
                  ? 'bg-white/15 text-white font-medium'
                  : 'text-white/70 hover:bg-white/10 hover:text-white'
              )}
            >
              <item.icon className="h-4 w-4 flex-shrink-0" />
              {item.label}
            </Link>
          )
        })}
      </nav>

      <div className="px-3 py-4 border-t border-white/10">
        <button
          onClick={handleSignOut}
          className="flex w-full items-center gap-3 rounded-md px-3 py-2 text-sm text-white/70 hover:bg-white/10 hover:text-white transition-colors"
        >
          <LogOut className="h-4 w-4" />
          Sign Out
        </button>
      </div>
    </aside>
  )
}
