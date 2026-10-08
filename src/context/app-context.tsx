'use client'

import React, { createContext, useContext, useEffect, useState, useMemo } from 'react'
import {
  Account,
  Profile,
  RecurringExpense,
  Transaction,
  InstallmentPlan,
  SocialFeedItem,
  MonthlyForecastSummary,
  FriendshipDetail,
} from '@/types'
import {
  simulateInstallmentPlan,
  calculateMonthlyForecast,
  getNextMonthKey,
  getCurrentMonthKey,
} from '@/lib/installment-engine'
import {
  isSupabaseConfigured,
  fetchUserData,
  fetchFriendships,
  fetchSocialFeed,
  sendFriendRequest as supabaseSendFriendRequest,
  respondFriendRequest as supabaseRespondFriendRequest,
  supabaseSignOut,
} from '@/lib/supabase/service'

interface AppContextType {
  currentUser: Profile | null
  setLoggedInUser: (profile: Profile | null) => void
  signOut: () => void

  // Navigation & Modals
  activeTab: 'dashboard' | 'installments' | 'friends'
  setActiveTab: (tab: 'dashboard' | 'installments' | 'friends') => void
  isAddModalOpen: boolean
  setIsAddModalOpen: (open: boolean) => void
  isAddCardOpen: boolean
  setIsAddCardOpen: (open: boolean) => void

  // Nakit Alanı
  cashBalance: number
  updateCashBalance: (amount: number, type: 'income' | 'expense', description: string, category?: string) => void

  // Kartlar Alanı
  cards: Account[]
  addCard: (card: {
    name: string
    bank_name: string
    type: 'credit_card' | 'bank'
    credit_limit?: number
    balance?: number
    cutoff_day?: number
    due_day?: number
  }) => void
  deleteCard: (cardId: string) => void

  // Harcamalar & Taksitler
  transactions: Transaction[]
  installmentPlans: InstallmentPlan[]
  addCardTransaction: (data: {
    card_id: string
    amount: number
    description: string
    category: string
    installment_count: number // 1 = Tek Çekim, >1 = Taksit
    is_private?: boolean
  }) => void
  deleteTransaction: (id: string) => void

  // Sabit Giderler
  recurringExpenses: RecurringExpense[]
  addRecurringExpense: (data: { title: string; amount: number; day_of_month: number }) => void
  deleteRecurringExpense: (id: string) => void

  // Arkadaşlık & Sosyal
  friendships: FriendshipDetail[]
  socialFeed: SocialFeedItem[]
  sendFriendRequest: (userCode: string) => Promise<{ success: boolean; message: string }>
  respondFriendRequest: (friendshipId: string, status: 'accepted' | 'rejected') => Promise<void>

  // Sade Hesaplanan Metrikler
  totalCash: number
  totalCreditDebt: number
  nextMonthForecast: MonthlyForecastSummary
}

const AppContext = createContext<AppContextType | undefined>(undefined)

const STORAGE_KEY = 'paratakip_pure_state_v2'

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [currentUser, setCurrentUser] = useState<Profile | null>(null)
  const [activeTab, setActiveTab] = useState<'dashboard' | 'installments' | 'friends'>('dashboard')
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [isAddCardOpen, setIsAddCardOpen] = useState(false)

  // Pure initial states (0 TL, 0 kart, 0 harcama)
  const [cashBalance, setCashBalance] = useState<number>(0)
  const [cards, setCards] = useState<Account[]>([])
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [installmentPlans, setInstallmentPlans] = useState<InstallmentPlan[]>([])
  const [recurringExpenses, setRecurringExpenses] = useState<RecurringExpense[]>([])
  const [friendships, setFriendships] = useState<FriendshipDetail[]>([])
  const [socialFeed, setSocialFeed] = useState<SocialFeedItem[]>([])
  const [isLoaded, setIsLoaded] = useState(false)

  // 1. Oturum ve Veri Yükleme (LocalStorage ve Supabase)
  useEffect(() => {
    try {
      const savedRaw = localStorage.getItem(STORAGE_KEY)
      if (savedRaw) {
        const saved = JSON.parse(savedRaw)
        if (saved.currentUser) setCurrentUser(saved.currentUser)
        if (typeof saved.cashBalance === 'number') setCashBalance(saved.cashBalance)
        if (Array.isArray(saved.cards)) setCards(saved.cards)
        if (Array.isArray(saved.transactions)) setTransactions(saved.transactions)
        if (Array.isArray(saved.installmentPlans)) setInstallmentPlans(saved.installmentPlans)
        if (Array.isArray(saved.recurringExpenses)) setRecurringExpenses(saved.recurringExpenses)
        if (Array.isArray(saved.friendships)) setFriendships(saved.friendships)
        if (Array.isArray(saved.socialFeed)) setSocialFeed(saved.socialFeed)
      }
    } catch {
      // LocalStorage access ignore
    } finally {
      setIsLoaded(true)
    }
  }, [])

  // 2. LocalStorage Senkronizasyonu
  useEffect(() => {
    if (!isLoaded) return
    try {
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({
          currentUser,
          cashBalance,
          cards,
          transactions,
          installmentPlans,
          recurringExpenses,
          friendships,
          socialFeed,
        })
      )
    } catch {
      // ignore
    }
  }, [currentUser, cashBalance, cards, transactions, installmentPlans, recurringExpenses, friendships, socialFeed, isLoaded])

  // Supabase'den veri çekme (Eğer oturum varsa)
  useEffect(() => {
    if (!currentUser || !isSupabaseConfigured()) return

    const loadRemote = async () => {
      try {
        const [userData, friendData, feedData] = await Promise.all([
          fetchUserData(currentUser.id),
          fetchFriendships(currentUser.id),
          fetchSocialFeed(),
        ])
        if (userData.accounts.length > 0) setCards(userData.accounts.filter((a) => a.type !== 'cash'))
        const cashAcc = userData.accounts.find((a) => a.type === 'cash')
        if (cashAcc) setCashBalance(cashAcc.balance)
        if (userData.transactions.length > 0) setTransactions(userData.transactions)
        if (userData.installmentPlans.length > 0) setInstallmentPlans(userData.installmentPlans)
        if (userData.recurringExpenses.length > 0) setRecurringExpenses(userData.recurringExpenses)
        setFriendships(friendData)
        setSocialFeed(feedData)
      } catch (err) {
        console.error('Veri senkronizasyon hatası:', err)
      }
    }

    loadRemote()
  }, [currentUser])

  // Oturum Yönetimi
  const setLoggedInUser = (profile: Profile | null) => {
    setCurrentUser(profile)
    if (!profile) {
      // Sıfırla
      setCashBalance(0)
      setCards([])
      setTransactions([])
      setInstallmentPlans([])
      setRecurringExpenses([])
      setFriendships([])
      setSocialFeed([])
      localStorage.removeItem(STORAGE_KEY)
    }
  }

  const signOut = async () => {
    if (isSupabaseConfigured()) {
      await supabaseSignOut()
    }
    setLoggedInUser(null)
  }

  // --------------------------------------------------------------------------
  // NAKİT İŞLEMLERİ
  // --------------------------------------------------------------------------
  const updateCashBalance = (
    amount: number,
    type: 'income' | 'expense',
    description: string,
    category: string = 'Nakit İşlem'
  ) => {
    if (!currentUser) return
    const delta = type === 'income' ? amount : -amount
    setCashBalance((prev) => prev + delta)

    const newTx: Transaction = {
      id: `tx-cash-${Date.now()}`,
      user_id: currentUser.id,
      account_id: 'cash-wallet',
      amount: amount,
      description: `${type === 'income' ? '[+] Gelir: ' : '[-] Harcama: '}${description}`,
      category,
      transaction_date: new Date().toISOString().split('T')[0],
      is_private: true,
      installment_group_id: null,
      created_at: new Date().toISOString(),
    }

    setTransactions((prev) => [newTx, ...prev])
  }

  // --------------------------------------------------------------------------
  // KART İŞLEMLERİ
  // --------------------------------------------------------------------------
  const addCard = (cardData: {
    name: string
    bank_name: string
    type: 'credit_card' | 'bank'
    credit_limit?: number
    balance?: number
    cutoff_day?: number
    due_day?: number
  }) => {
    if (!currentUser) return
    const newCard: Account = {
      id: `card-${Date.now()}`,
      user_id: currentUser.id,
      name: cardData.name,
      type: cardData.type,
      bank_name: cardData.bank_name,
      balance: cardData.type === 'credit_card' ? -Math.abs(cardData.balance || 0) : (cardData.balance || 0),
      credit_limit: cardData.type === 'credit_card' ? (cardData.credit_limit || 0) : 0,
      cutoff_day: cardData.type === 'credit_card' ? (cardData.cutoff_day || 15) : null,
      due_day: cardData.type === 'credit_card' ? (cardData.due_day || 25) : null,
      color: '#1A3636',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }
    setCards((prev) => [...prev, newCard])
  }

  const deleteCard = (cardId: string) => {
    setCards((prev) => prev.filter((c) => c.id !== cardId))
    setTransactions((prev) => prev.filter((t) => t.account_id !== cardId))
    setInstallmentPlans((prev) => prev.filter((p) => p.account_id !== cardId))
  }

  // --------------------------------------------------------------------------
  // KREDİ KARTI HARCAMASI & TAKSİT MOTORU
  // --------------------------------------------------------------------------
  const addCardTransaction = (data: {
    card_id: string
    amount: number
    description: string
    category: string
    installment_count: number // 1 = Tek Çekim, >1 = Taksit
    is_private?: boolean
  }) => {
    if (!currentUser) return
    const card = cards.find((c) => c.id === data.card_id)
    if (!card) return

    const txDate = new Date().toISOString().split('T')[0]
    const groupId = data.installment_count > 1 ? `grp-${Date.now()}` : null

    // Kartın borcunu artır
    setCards((prev) =>
      prev.map((c) =>
        c.id === data.card_id
          ? { ...c, balance: c.balance - data.amount }
          : c
      )
    )

    // Taksitli ise taksit dilimlerini gelecek aylara dağıt
    if (data.installment_count > 1) {
      const cutoffDay = card.cutoff_day || 15
      const sim = simulateInstallmentPlan({
        totalAmount: data.amount,
        installmentCount: data.installment_count,
        transactionDate: txDate,
        cutoffDay,
        dueDay: card.due_day || 25,
      })

      const newPlans: InstallmentPlan[] = sim.schedule.map((item) => ({
        id: `inst-${groupId}-${item.installmentNumber}`,
        user_id: currentUser.id,
        account_id: data.card_id,
        transaction_id: `tx-${Date.now()}`,
        installment_group_id: groupId!,
        total_amount: data.amount,
        installment_count: data.installment_count,
        current_installment: item.installmentNumber,
        installment_amount: item.amount,
        due_month_year: item.dueMonthYear,
        due_date: item.dueDate,
        status: 'upcoming' as const,
        created_at: new Date().toISOString(),
      }))

      setInstallmentPlans((prev) => [...prev, ...newPlans])
    }

    // Ana harcama kaydı
    const newTx: Transaction = {
      id: `tx-${Date.now()}`,
      user_id: currentUser.id,
      account_id: data.card_id,
      amount: data.amount,
      description: data.installment_count > 1
        ? `${data.description} (${data.installment_count} Taksit)`
        : data.description,
      category: data.category,
      transaction_date: txDate,
      is_private: data.is_private || false,
      installment_group_id: groupId,
      created_at: new Date().toISOString(),
    }

    setTransactions((prev) => [newTx, ...prev])

    // Sosyal akışa ekle (eğer gizli değilse)
    if (!data.is_private) {
      setSocialFeed((prev) => [
        {
          transaction_id: newTx.id,
          user_id: currentUser.id,
          user_name: currentUser.full_name,
          user_code: currentUser.user_code,
          avatar_url: currentUser.avatar_url,
          amount: data.amount,
          description: newTx.description,
          category: data.category,
          transaction_date: txDate,
          created_at: newTx.created_at,
        },
        ...prev,
      ])
    }
  }

  const deleteTransaction = (id: string) => {
    const tx = transactions.find((t) => t.id === id)
    if (!tx) return

    setTransactions((prev) => prev.filter((t) => t.id !== id))
    if (tx.installment_group_id) {
      setInstallmentPlans((prev) => prev.filter((p) => p.installment_group_id !== tx.installment_group_id))
    }
    setSocialFeed((prev) => prev.filter((s) => s.transaction_id !== id))
  }

  // --------------------------------------------------------------------------
  // SABİT GİDERLER
  // --------------------------------------------------------------------------
  const addRecurringExpense = (data: { title: string; amount: number; day_of_month: number }) => {
    if (!currentUser) return
    const newRec: RecurringExpense = {
      id: `rec-${Date.now()}`,
      user_id: currentUser.id,
      account_id: null,
      title: data.title,
      amount: data.amount,
      category: 'Sabit Gider',
      day_of_month: data.day_of_month,
      is_active: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }
    setRecurringExpenses((prev) => [...prev, newRec])
  }

  const deleteRecurringExpense = (id: string) => {
    setRecurringExpenses((prev) => prev.filter((r) => r.id !== id))
  }

  // --------------------------------------------------------------------------
  // ARKADAŞLIK VE SOSYAL AKIŞ
  // --------------------------------------------------------------------------
  const sendFriendRequest = async (userCode: string) => {
    if (!currentUser) return { success: false, message: 'Oturum açık değil.' }
    const cleanCode = userCode.trim().toUpperCase()
    if (cleanCode === currentUser.user_code) {
      return { success: false, message: 'Kendi kullanıcı kodunuzu ekleyemezsiniz.' }
    }

    if (isSupabaseConfigured()) {
      const res = await supabaseSendFriendRequest(currentUser.id, cleanCode)
      if (res.success) {
        // Yeniden çek
        const fList = await fetchFriendships(currentUser.id)
        setFriendships(fList)
      }
      return res
    }

    // Lokal Demo Modu Simülasyonu
    const mockFriend: Profile = {
      id: `usr-fr-${Date.now()}`,
      user_code: cleanCode,
      full_name: `Kullanıcı (${cleanCode})`,
      email: null,
      avatar_url: null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }

    const newFriendship: FriendshipDetail = {
      id: `fr-${Date.now()}`,
      status: 'accepted',
      isIncoming: false,
      friendProfile: mockFriend,
      created_at: new Date().toISOString(),
    }

    setFriendships((prev) => [...prev, newFriendship])
    return { success: true, message: `${cleanCode} kullanıcısı başarıyla eklendi!` }
  }

  const respondFriendRequest = async (friendshipId: string, status: 'accepted' | 'rejected') => {
    if (isSupabaseConfigured()) {
      await supabaseRespondFriendRequest(friendshipId, status)
      if (currentUser) {
        const fList = await fetchFriendships(currentUser.id)
        setFriendships(fList)
      }
      return
    }

    setFriendships((prev) =>
      prev.map((f) => (f.id === friendshipId ? { ...f, status } : f))
    )
  }

  // --------------------------------------------------------------------------
  // HESAPLANMIŞ SADE METRİKLER
  // --------------------------------------------------------------------------
  const totalCash = cashBalance

  const totalCreditDebt = useMemo(() => {
    return cards
      .filter((c) => c.type === 'credit_card')
      .reduce((sum, c) => sum + Math.abs(c.balance), 0)
  }, [cards])

  const [nextMonthKey, setNextMonthKey] = useState<string>('2026-11')

  useEffect(() => {
    try {
      setNextMonthKey(getNextMonthKey(new Date()))
    } catch {
      // ignore
    }
  }, [])

  const nextMonthForecast = useMemo(() => {
    const enriched = installmentPlans.map((item) => {
      const card = cards.find((c) => c.id === item.account_id)
      return {
        ...item,
        accountName: card?.name || 'Kredi Kartı',
        bankName: card?.bank_name,
      }
    })

    return calculateMonthlyForecast({
      targetMonthYear: nextMonthKey,
      installments: enriched,
      recurringExpenses,
    })
  }, [nextMonthKey, installmentPlans, cards, recurringExpenses])

  return (
    <AppContext.Provider
      value={{
        currentUser,
        setLoggedInUser,
        signOut,
        activeTab,
        setActiveTab,
        isAddModalOpen,
        setIsAddModalOpen,
        isAddCardOpen,
        setIsAddCardOpen,
        cashBalance,
        updateCashBalance,
        cards,
        addCard,
        deleteCard,
        transactions,
        installmentPlans,
        addCardTransaction,
        deleteTransaction,
        recurringExpenses,
        addRecurringExpense,
        deleteRecurringExpense,
        friendships,
        socialFeed,
        sendFriendRequest,
        respondFriendRequest,
        totalCash,
        totalCreditDebt,
        nextMonthForecast,
      }}
    >
      {children}
    </AppContext.Provider>
  )
}

export function useApp() {
  const context = useContext(AppContext)
  if (!context) {
    throw new Error('useApp must be used within an AppProvider')
  }
  return context
}
