'use client'

import React, { useEffect, useState } from 'react'
import { useTheme } from 'next-themes'
import { Sun, Moon } from 'lucide-react'

export function ThemeToggle() {
  const { theme, setTheme, resolvedTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return (
      <div className="w-8 h-8 rounded-full bg-[#FFFFFF] dark:bg-[#182421] border border-[#E8E3DD] dark:border-[#263834] opacity-50" />
    )
  }

  const isDark = resolvedTheme === 'dark'

  return (
    <button
      onClick={() => setTheme(isDark ? 'light' : 'dark')}
      aria-label={isDark ? 'Açık Temaya Geç' : 'Koyu Temaya Geç'}
      title={isDark ? 'Açık Mod' : 'Koyu Mod'}
      className="w-8 h-8 rounded-full bg-[#FFFFFF] dark:bg-[#182421] border border-[#E8E3DD] dark:border-[#263834] flex items-center justify-center text-[#1A3636] dark:text-[#7EA68E] hover:bg-[#F2EFEA] dark:hover:bg-[#20302C] active:scale-95 transition-all shadow-2xs"
    >
      {isDark ? (
        <Sun className="w-4 h-4 text-[#7EA68E] transition-transform duration-300 hover:rotate-45" />
      ) : (
        <Moon className="w-4 h-4 text-[#1A3636] transition-transform duration-300 hover:-rotate-12" />
      )}
    </button>
  )
}
