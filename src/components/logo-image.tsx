'use client'

export function LogoImage({ className }: { className?: string }) {
  return (
    <img
      src="/logo.svg"
      alt="LA Translation & Interpretation"
      className={className}
      onError={(e) => { (e.target as HTMLImageElement).style.display = 'none' }}
    />
  )
}
