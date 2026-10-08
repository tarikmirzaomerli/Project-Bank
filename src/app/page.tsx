'use client'

import React from 'react'
import { AppProvider, useApp } from '@/context/app-context'
import { AuthScreen } from '@/components/AuthScreen'
import { Header } from '@/components/Header'
import { BottomNav } from '@/components/BottomNav'
import { DashboardView } from '@/components/DashboardView'
import { InstallmentsView } from '@/components/InstallmentsView'
import { SocialFeedView } from '@/components/SocialFeedView'
import { QuickAddModal } from '@/components/QuickAddModal'
import { AddAccountModal } from '@/components/AddAccountModal'

function AppContent() {
  const { currentUser, activeTab, isLoaded } = useApp()

  // Oturum durumu doğrulanırken temaya uygun geçiş ekranı
  if (!isLoaded) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#F9F8F6] dark:bg-[#0F1715] transition-colors p-4">
        <div className="w-12 h-12 rounded-2xl bg-[#1A3636] dark:bg-[#1E332E] border border-transparent dark:border-[#263834] flex items-center justify-center text-[#F9F8F6] dark:text-[#7EA68E] font-black text-xl shadow-md animate-pulse mb-3">
          <span>₺</span>
        </div>
        <p className="text-xs font-semibold text-[#5A6B68] dark:text-[#8C9E99] animate-pulse">
          Oturum kontrol ediliyor...
        </p>
      </div>
    )
  }

  // Kullanıcı oturum açmamışsa doğrudan giriş ekranı
  if (!currentUser) {
    return <AuthScreen />
  }

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-1 overflow-y-auto">
        {activeTab === 'dashboard' && <DashboardView />}
        {activeTab === 'installments' && <InstallmentsView />}
        {activeTab === 'friends' && <SocialFeedView />}
      </main>
      <BottomNav />
      <QuickAddModal />
      <AddAccountModal />
    </div>
  )
}

export default function Home() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  )
}
