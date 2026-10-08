import { Database } from './database'

export type Profile = Database['public']['Tables']['profiles']['Row']
export type Friendship = Database['public']['Tables']['friendships']['Row']
export type Account = Database['public']['Tables']['accounts']['Row']
export type Transaction = Database['public']['Tables']['transactions']['Row']
export type InstallmentPlan = Database['public']['Tables']['installment_plans']['Row']
export type RecurringExpense = Database['public']['Tables']['recurring_expenses']['Row']
export type SocialFeedItem = Database['public']['Views']['social_feed_view']['Row']

export type AccountType = 'cash' | 'bank' | 'credit_card'

export interface BankPreset {
  id: string
  name: string
  shortName: string
  color: string
}

export const TURKISH_BANKS: BankPreset[] = [
  { id: 'garanti', name: 'Garanti BBVA', shortName: 'Garanti', color: '#008542' },
  { id: 'isbank', name: 'Türkiye İş Bankası', shortName: 'İş Bankası', color: '#0047BA' },
  { id: 'yapikredi', name: 'Yapı Kredi', shortName: 'Yapı Kredi', color: '#002E6D' },
  { id: 'akbank', name: 'Akbank', shortName: 'Akbank', color: '#E30613' },
  { id: 'ziraat', name: 'Ziraat Bankası', shortName: 'Ziraat', color: '#CE1126' },
  { id: 'qnb', name: 'QNB Finansbank', shortName: 'QNB', color: '#6A1A74' },
  { id: 'enpara', name: 'Enpara.com', shortName: 'Enpara', color: '#7E3696' },
  { id: 'teb', name: 'TEB', shortName: 'TEB', color: '#00843D' },
  { id: 'vakif', name: 'VakıfBank', shortName: 'VakıfBank', color: '#F8B133' },
  { id: 'diger', name: 'Diğer Banka', shortName: 'Diğer', color: '#40534C' },
]

export const EXPENSE_CATEGORIES = [
  'Market & Gıda',
  'Yeme & İçme',
  'Ulaşım & Akaryakıt',
  'Teknoloji',
  'Giyim & Moda',
  'Faturalar & Abonelikler',
  'Ev & Yaşam',
  'Sağlık',
  'Eğlence',
  'Diğer',
] as const

export interface InstallmentSimulationItem {
  installmentNumber: number
  totalInstallments: number
  amount: number
  dueMonthYear: string // '2026-11'
  dueMonthLabel: string // 'Kasım 2026'
  dueDate: string // '2026-11-20'
  isFirstInstallment: boolean
}

export interface InstallmentSimulationResult {
  totalAmount: number
  installmentCount: number
  amountPerMonth: number
  firstDueMonth: string
  firstDueMonthLabel: string
  schedule: InstallmentSimulationItem[]
}

export interface MonthlyForecastSummary {
  targetMonthYear: string // '2026-11'
  targetMonthLabel: string // 'Kasım 2026'
  totalForecast: number
  installmentsTotal: number
  recurringTotal: number
  installmentsList: (InstallmentPlan & { accountName?: string; bankName?: string | null })[]
  recurringList: RecurringExpense[]
}

export interface FriendshipDetail {
  id: string
  status: 'pending' | 'accepted' | 'rejected'
  isIncoming: boolean
  friendProfile: Profile
  created_at: string
}
