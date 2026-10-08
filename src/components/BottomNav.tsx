'use client'

import React from 'react'
import { useApp } from '@/context/app-context'
import { LayoutDashboard, CalendarClock, Users, Plus } from 'lucide-react'

export function BottomNav() {
  const { activeTab, setActiveTab, setIsAddModalOpen } = useApp()

  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 max-w-md mx-auto">
      <nav className="bottom-nav-glass border-t border-[#E8E3DD]/80 dark:border-[#263834]/80 px-4 py-2 safe-bottom flex items-center justify-around relative transition-colors">
        {/* 1. Özet */}
        <button
          onClick={() => setActiveTab('dashboard')}
          className={`flex flex-col items-center justify-center py-1 px-3 rounded-xl transition-all ${
            activeTab === 'dashboard'
              ? 'text-[#1A3636] dark:text-[#F1EFEA] font-bold'
              : 'text-[#8B9593] dark:text-[#8C9E99] hover:text-[#1A3636] dark:hover:text-[#F1EFEA]'
          }`}
        >
          <div className="relative">
            <LayoutDashboard className={`w-5 h-5 ${activeTab === 'dashboard' ? 'stroke-[2.5]' : 'stroke-[1.8]'}`} />
            {activeTab === 'dashboard' && (
              <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1.5 h-1.5 bg-[#678E77] dark:bg-[#7EA68E] rounded-full" />
            )}
          </div>
          <span className="text-[11px] mt-1 tracking-tight">Özet</span>
        </button>

        {/* Ortadaki Yüzen Tek (+) Hızlı Ekle Butonu */}
        <div className="flex items-center justify-center -mt-5">
          <button
            onClick={() => setIsAddModalOpen(true)}
            aria-label="Hızlı Ekle"
            className="w-13 h-13 rounded-full bg-[#1A3636] dark:bg-[#7EA68E] text-[#F9F8F6] dark:text-[#0F1715] flex items-center justify-center shadow-lg shadow-[#1A3636]/30 dark:shadow-[#7EA68E]/20 active:scale-90 hover:bg-[#122525] dark:hover:bg-[#6D947C] transition-all border-4 border-[#F9F8F6] dark:border-[#0F1715]"
          >
            <Plus className="w-6 h-6 stroke-[2.6]" />
          </button>
        </div>

        {/* 2. Taksitler */}
        <button
          onClick={() => setActiveTab('installments')}
          className={`flex flex-col items-center justify-center py-1 px-3 rounded-xl transition-all ${
            activeTab === 'installments'
              ? 'text-[#1A3636] dark:text-[#F1EFEA] font-bold'
              : 'text-[#8B9593] dark:text-[#8C9E99] hover:text-[#1A3636] dark:hover:text-[#F1EFEA]'
          }`}
        >
          <div className="relative">
            <CalendarClock className={`w-5 h-5 ${activeTab === 'installments' ? 'stroke-[2.5]' : 'stroke-[1.8]'}`} />
            {activeTab === 'installments' && (
              <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1.5 h-1.5 bg-[#678E77] dark:bg-[#7EA68E] rounded-full" />
            )}
          </div>
          <span className="text-[11px] mt-1 tracking-tight">Taksitler</span>
        </button>

        {/* 3. Arkadaşlar */}
        <button
          onClick={() => setActiveTab('friends')}
          className={`flex flex-col items-center justify-center py-1 px-3 rounded-xl transition-all ${
            activeTab === 'friends'
              ? 'text-[#1A3636] dark:text-[#F1EFEA] font-bold'
              : 'text-[#8B9593] dark:text-[#8C9E99] hover:text-[#1A3636] dark:hover:text-[#F1EFEA]'
          }`}
        >
          <div className="relative">
            <Users className={`w-5 h-5 ${activeTab === 'friends' ? 'stroke-[2.5]' : 'stroke-[1.8]'}`} />
            {activeTab === 'friends' && (
              <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1.5 h-1.5 bg-[#678E77] dark:bg-[#7EA68E] rounded-full" />
            )}
          </div>
          <span className="text-[11px] mt-1 tracking-tight">Arkadaşlar</span>
        </button>
      </nav>
    </div>
  )
}
