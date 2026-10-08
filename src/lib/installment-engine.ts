import { InstallmentSimulationResult, InstallmentSimulationItem, InstallmentPlan, RecurringExpense, MonthlyForecastSummary } from '@/types'

const MONTH_NAMES_TR = [
  'Ocak', 'Şubat', 'Mart', 'Nisan', 'Mayıs', 'Haziran',
  'Temmuz', 'Ağustos', 'Eylül', 'Ekim', 'Kasım', 'Aralık'
]

/**
 * Format 'YYYY-MM' string to Turkish human readable (e.g. '2026-11' -> 'Kasım 2026')
 */
export function formatMonthYearTR(monthYearStr: string): string {
  const [yearStr, monthStr] = monthYearStr.split('-')
  const monthIdx = parseInt(monthStr, 10) - 1
  return `${MONTH_NAMES_TR[monthIdx] || ''} ${yearStr}`
}

/**
 * Format currency to Turkish Lira (e.g. 1450.50 -> "₺1.450,50")
 */
export function formatCurrencyTR(amount: number): string {
  return new Intl.NumberFormat('tr-TR', {
    style: 'currency',
    currency: 'TRY',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount)
}

/**
 * Format date to TR (e.g. "8 Eki 2026")
 */
export function formatDateTR(dateInput: string | Date): string {
  const date = typeof dateInput === 'string' ? new Date(dateInput) : dateInput
  return new Intl.DateTimeFormat('tr-TR', {
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  }).format(date)
}

/**
 * Taksit Motoru:
 * Ekstre kesim gününe ve harcama tarihine göre taksit dilimlerini hesaplar.
 */
export function simulateInstallmentPlan({
  totalAmount,
  installmentCount,
  transactionDate,
  cutoffDay = 15,
  dueDay = (cutoffDay + 10) > 30 ? (cutoffDay + 10) - 30 : (cutoffDay + 10)
}: {
  totalAmount: number
  installmentCount: number
  transactionDate?: Date | string
  cutoffDay?: number
  dueDay?: number
}): InstallmentSimulationResult {
  const txDate = transactionDate
    ? (typeof transactionDate === 'string' ? new Date(transactionDate) : transactionDate)
    : new Date('2026-10-08T12:00:00Z')

  const txDay = txDate.getDate()
  let txYear = txDate.getFullYear()
  let txMonth = txDate.getMonth() // 0-indexed (0 = Ocak, 9 = Ekim)

  // Ekstre günü geçtiyse ilk taksit bir sonraki ayın ekstresine yansır
  if (txDay > cutoffDay) {
    txMonth += 1
    if (txMonth > 11) {
      txMonth = 0
      txYear += 1
    }
  }

  // Eşit dilimlere bölme ve kuruş yuvarlama kontrolü
  const baseAmount = Math.floor((totalAmount / installmentCount) * 100) / 100
  const remainder = Math.round((totalAmount - (baseAmount * installmentCount)) * 100) / 100

  const schedule: InstallmentSimulationItem[] = []

  let currentYear = txYear
  let currentMonth = txMonth

  for (let i = 1; i <= installmentCount; i++) {
    // Son taksite kalan küsuratı ekleyerek toplamın kuruşu kuruşuna denk olmasını sağlarız
    const instAmount = i === installmentCount ? +(baseAmount + remainder).toFixed(2) : baseAmount

    const monthNum = currentMonth + 1
    const monthPad = monthNum < 10 ? `0${monthNum}` : `${monthNum}`
    const dueMonthYear = `${currentYear}-${monthPad}`
    const dueMonthLabel = `${MONTH_NAMES_TR[currentMonth]} ${currentYear}`
    
    // Son ödeme günü tarihi (Günü ayın sınırına göre düzelt)
    const daysInCurrentMonth = new Date(currentYear, currentMonth + 1, 0).getDate()
    const validDueDay = Math.min(dueDay, daysInCurrentMonth)
    const dueDayPad = validDueDay < 10 ? `0${validDueDay}` : `${validDueDay}`
    const dueDate = `${currentYear}-${monthPad}-${dueDayPad}`

    schedule.push({
      installmentNumber: i,
      totalInstallments: installmentCount,
      amount: instAmount,
      dueMonthYear,
      dueMonthLabel,
      dueDate,
      isFirstInstallment: i === 1,
    })

    // Bir sonraki aya geçiş
    currentMonth += 1
    if (currentMonth > 11) {
      currentMonth = 0
      currentYear += 1
    }
  }

  return {
    totalAmount,
    installmentCount,
    amountPerMonth: baseAmount,
    firstDueMonth: schedule[0].dueMonthYear,
    firstDueMonthLabel: schedule[0].dueMonthLabel,
    schedule,
  }
}

/**
 * Hedef ay için (Örn: Gelecek Ay) tahmini borç/yük hesaplama
 */
export function calculateMonthlyForecast({
  targetMonthYear,
  installments,
  recurringExpenses
}: {
  targetMonthYear: string // 'YYYY-MM'
  installments: (InstallmentPlan & { accountName?: string; bankName?: string | null })[]
  recurringExpenses: RecurringExpense[]
}): MonthlyForecastSummary {
  // Hedef aya denk gelen taksitler
  const targetInstallments = installments.filter(
    (item) => item.due_month_year === targetMonthYear
  )
  const installmentsTotal = targetInstallments.reduce(
    (sum, item) => sum + Number(item.installment_amount),
    0
  )

  // Aktif sabit giderler (her ay düzenli ödenenler)
  const activeRecurring = recurringExpenses.filter((item) => item.is_active)
  const recurringTotal = activeRecurring.reduce(
    (sum, item) => sum + Number(item.amount),
    0
  )

  const totalForecast = installmentsTotal + recurringTotal

  return {
    targetMonthYear,
    targetMonthLabel: formatMonthYearTR(targetMonthYear),
    totalForecast,
    installmentsTotal,
    recurringTotal,
    installmentsList: targetInstallments,
    recurringList: activeRecurring,
  }
}

/**
 * 'YYYY-MM' formatında bir sonraki ayı döner
 */
export function getNextMonthKey(fromDate?: Date | string): string {
  const d = fromDate
    ? (typeof fromDate === 'string' ? new Date(fromDate) : new Date(fromDate))
    : new Date('2026-10-08T12:00:00Z')
  d.setMonth(d.getMonth() + 1)
  const y = d.getFullYear()
  const m = d.getMonth() + 1
  return `${y}-${m < 10 ? `0${m}` : m}`
}

/**
 * 'YYYY-MM' formatında mevcut ayı döner
 */
export function getCurrentMonthKey(fromDate?: Date | string): string {
  const d = fromDate
    ? (typeof fromDate === 'string' ? new Date(fromDate) : new Date(fromDate))
    : new Date('2026-10-08T12:00:00Z')
  const y = d.getFullYear()
  const m = d.getMonth() + 1
  return `${y}-${m < 10 ? `0${m}` : m}`
}

/**
 * Bugünden itibaren X ay sonrasının ay anahtarlarını üretir
 */
export function getUpcomingMonthKeys(count = 6, fromDate?: Date | string): string[] {
  const keys: string[] = []
  const d = fromDate
    ? (typeof fromDate === 'string' ? new Date(fromDate) : new Date(fromDate))
    : new Date('2026-10-08T12:00:00Z')
  for (let i = 0; i < count; i++) {
    const temp = new Date(d.getFullYear(), d.getMonth() + i, 1)
    const y = temp.getFullYear()
    const m = temp.getMonth() + 1
    keys.push(`${y}-${m < 10 ? `0${m}` : m}`)
  }
  return keys
}
