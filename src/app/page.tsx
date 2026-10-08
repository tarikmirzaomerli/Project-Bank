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
  const { currentUser, activeTab } = useApp()

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
