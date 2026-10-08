'use client'

import React, { useState } from 'react'
import { useApp } from '@/context/app-context'
import { Copy, Check, LogOut } from 'lucide-react'
import { ThemeToggle } from '@/components/ThemeToggle'

export function Header() {
  const { currentUser, signOut } = useApp()
  const [copied, setCopied] = useState(false)

  const handleCopyCode = () => {
    if (!currentUser) return
    navigator.clipboard?.writeText(currentUser.user_code)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <header className="sticky top-0 z-40 bg-[#F9F8F6]/90 dark:bg-[#0F1715]/90 backdrop-blur-md border-b border-[#E8E3DD]/70 dark:border-[#263834]/80 px-4 py-3 safe-top transition-colors">
      <div className="flex items-center justify-between">
        {/* App Title */}
        <div className="flex items-center space-x-2">
          <div className="w-7 h-7 rounded-lg bg-[#1A3636] dark:bg-[#1E332E] border border-transparent dark:border-[#263834] flex items-center justify-center text-[#F9F8F6] dark:text-[#7EA68E] font-extrabold text-xs">
            <span>₺</span>
          </div>
          <div>
            <h1 className="font-extrabold text-sm tracking-tight text-[#1A3636] dark:text-[#F1EFEA] leading-none">
              ParaTakip
            </h1>
            <span className="text-[10px] text-[#5A6B68] dark:text-[#8C9E99] font-medium leading-none">
              {currentUser?.full_name || 'Kişisel Muhasebe'}
            </span>
          </div>
        </div>

        {/* Right Actions: User Code, Theme Toggle, & Sign Out */}
        <div className="flex items-center space-x-1.5">
          {currentUser && (
            <button
              onClick={handleCopyCode}
              title="Kullanıcı kodunu kopyala"
              className="flex items-center space-x-1 bg-[#FFFFFF] dark:bg-[#182421] hover:bg-[#F2EFEA] dark:hover:bg-[#20302C] border border-[#E8E3DD] dark:border-[#263834] active:scale-95 transition-all px-2.5 py-1 rounded-full shadow-2xs text-xs font-mono font-bold text-[#1A3636] dark:text-[#F1EFEA]"
            >
              <span>{currentUser.user_code}</span>
              {copied ? (
                <Check className="w-3 h-3 text-[#678E77] dark:text-[#7EA68E]" />
              ) : (
                <Copy className="w-3 h-3 text-[#8B9593] dark:text-[#8C9E99]" />
              )}
            </button>
          )}

          {/* Minimalist Sun / Moon Theme Toggle */}
          <ThemeToggle />

          <button
            onClick={signOut}
            title="Çıkış Yap"
            className="w-8 h-8 rounded-full bg-[#FFFFFF] dark:bg-[#182421] border border-[#E8E3DD] dark:border-[#263834] flex items-center justify-center text-[#8B9593] dark:text-[#8C9E99] hover:text-rose-600 dark:hover:text-rose-400 transition-colors shadow-2xs"
          >
            <LogOut className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </header>
  )
}
