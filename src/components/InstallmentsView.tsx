'use client'

import React, { useState, useMemo } from 'react'
import { useApp } from '@/context/app-context'
import { CalendarClock, Plus, Trash2 } from 'lucide-react'
import { formatCurrencyTR, formatMonthYearTR, getUpcomingMonthKeys, calculateMonthlyForecast } from '@/lib/installment-engine'

export function InstallmentsView() {
  const {
    installmentPlans,
    recurringExpenses,
    cards,
    setIsAddModalOpen,
    deleteRecurringExpense,
  } = useApp()

  const defaultKeys = ['2026-10', '2026-11', '2026-12', '2027-01', '2027-02', '2027-03']
  const [upcomingMonthKeys, setUpcomingMonthKeys] = useState<string[]>(defaultKeys)
  const [selectedMonthKey, setSelectedMonthKey] = useState<string>('2026-11')

  React.useEffect(() => {
    const keys = getUpcomingMonthKeys(6, new Date())
    setUpcomingMonthKeys(keys)
    if (keys[1]) setSelectedMonthKey(keys[1])
  }, [])

  // Kart bilgileri ile zenginleştirme
  const enriched = useMemo(() => {
    return installmentPlans.map((item) => {
      const card = cards.find((c) => c.id === item.account_id)
      return {
        ...item,
        accountName: card?.name || 'Kredi Kartı',
        bankName: card?.bank_name,
      }
    })
  }, [installmentPlans, cards])

  // Seçili ayın hesaplaması
  const currentMonthData = useMemo(() => {
    return calculateMonthlyForecast({
      targetMonthYear: selectedMonthKey,
      installments: enriched,
      recurringExpenses,
    })
  }, [selectedMonthKey, enriched, recurringExpenses])

  return (
    <div className="space-y-4 pb-24 px-4 pt-3">
      {/* Başlık */}
      <div className="flex items-center justify-between">
        <h2 className="text-base font-extrabold text-[#1A3636] dark:text-[#F1EFEA] flex items-center space-x-1.5">
          <CalendarClock className="w-4 h-4 text-[#678E77] dark:text-[#7EA68E]" />
          <span>Taksitler & Sabit Giderler</span>
        </h2>
        <button
          onClick={() => setIsAddModalOpen(true)}
          className="text-xs font-bold text-[#F9F8F6] dark:text-[#0F1715] bg-[#1A3636] dark:bg-[#7EA68E] hover:bg-[#122525] dark:hover:bg-[#6D947C] px-3 py-1.5 rounded-xl flex items-center space-x-1 transition-all"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Ekle</span>
        </button>
      </div>

      {/* Sade Ay Seçici */}
      <div className="flex space-x-1.5 overflow-x-auto pb-1 no-scrollbar -mx-4 px-4">
        {upcomingMonthKeys.map((mKey) => {
          const isSelected = mKey === selectedMonthKey
          return (
            <button
              key={mKey}
              onClick={() => setSelectedMonthKey(mKey)}
              className={`shrink-0 px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
                isSelected
                  ? 'bg-[#1A3636] dark:bg-[#7EA68E] text-[#F9F8F6] dark:text-[#0F1715] shadow-xs'
                  : 'bg-[#FFFFFF] dark:bg-[#182421] border border-[#E8E3DD] dark:border-[#263834] text-[#5A6B68] dark:text-[#8C9E99] hover:text-[#1A3636] dark:hover:text-[#F1EFEA]'
              }`}
            >
              {formatMonthYearTR(mKey)}
            </button>
          )
        })}
      </div>

      {/* Seçili Ay Toplam Ödeme Vurgusu */}
      <div className="p-4 bg-[#FFFFFF] dark:bg-[#182421] rounded-2xl border border-[#E8E3DD] dark:border-[#263834] shadow-2xs flex items-center justify-between transition-colors">
        <div>
          <span className="text-[11px] text-[#5A6B68] dark:text-[#8C9E99] font-bold uppercase tracking-wider block">
            {currentMonthData.targetMonthLabel} Toplamı
          </span>
          <div className="text-xl font-black text-[#1A3636] dark:text-[#F1EFEA] mt-0.5">
            {formatCurrencyTR(currentMonthData.totalForecast)}
          </div>
        </div>
        <div className="text-right text-xs text-[#8B9593] dark:text-[#8C9E99]">
          <div>Taksitler: <strong className="text-[#1A3636] dark:text-[#F1EFEA]">{formatCurrencyTR(currentMonthData.installmentsTotal)}</strong></div>
          <div>Sabit Giderler: <strong className="text-[#1A3636] dark:text-[#F1EFEA]">{formatCurrencyTR(currentMonthData.recurringTotal)}</strong></div>
        </div>
      </div>

      {/* Bu Ayın Taksitleri */}
      <div className="space-y-2">
        <h3 className="text-xs font-bold text-[#5A6B68] dark:text-[#8C9E99] uppercase tracking-wider">
          Taksit Dilimleri ({currentMonthData.installmentsList.length})
        </h3>

        {currentMonthData.installmentsList.length === 0 ? (
          <div className="p-4 text-center bg-[#FFFFFF] dark:bg-[#182421] rounded-2xl border border-[#E8E3DD] dark:border-[#263834] transition-colors">
            <p className="text-xs text-[#8B9593] dark:text-[#8C9E99]">Bu ay için planlanmış taksit bulunmuyor.</p>
          </div>
        ) : (
          <div className="bg-[#FFFFFF] dark:bg-[#182421] rounded-2xl border border-[#E8E3DD] dark:border-[#263834] divide-y divide-[#E8E3DD]/60 dark:divide-[#263834]/60 overflow-hidden shadow-2xs transition-colors">
            {currentMonthData.installmentsList.map((inst) => (
              <div
                key={inst.id}
                className="p-3 flex items-center justify-between hover:bg-[#FAF9F7] dark:hover:bg-[#1C2C28] transition-colors"
              >
                <div>
                  <div className="flex items-center space-x-1.5">
                    <span className="text-xs font-bold text-[#1A3636] dark:text-[#F1EFEA]">{inst.accountName}</span>
                    <span className="text-[10px] font-bold bg-[#EBF2ED] dark:bg-[#20302C] text-[#1A3636] dark:text-[#7EA68E] px-1.5 py-0.2 rounded-md">
                      {inst.current_installment}/{inst.installment_count}
                    </span>
                  </div>
                  <span className="text-[10px] text-[#8B9593] dark:text-[#8C9E99] mt-0.5 block">
                    Toplam: ₺{Number(inst.total_amount).toLocaleString('tr-TR')} • Son Ödeme: {inst.due_date}
                  </span>
                </div>

                <div className="text-right">
                  <span className="text-xs font-black text-[#1A3636] dark:text-[#F1EFEA]">
                    {formatCurrencyTR(inst.installment_amount)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Sabit Giderler Listesi */}
      <div className="space-y-2 pt-1">
        <h3 className="text-xs font-bold text-[#5A6B68] dark:text-[#8C9E99] uppercase tracking-wider">
          Aylık Düzenli Sabit Giderler ({recurringExpenses.length})
        </h3>

        {recurringExpenses.length === 0 ? (
          <div className="p-4 text-center bg-[#FFFFFF] dark:bg-[#182421] rounded-2xl border border-[#E8E3DD] dark:border-[#263834] transition-colors">
            <p className="text-xs text-[#8B9593] dark:text-[#8C9E99]">Sabit gider bulunmuyor (Kira, abonelik vb.).</p>
          </div>
        ) : (
          <div className="bg-[#FFFFFF] dark:bg-[#182421] rounded-2xl border border-[#E8E3DD] dark:border-[#263834] divide-y divide-[#E8E3DD]/60 dark:divide-[#263834]/60 overflow-hidden shadow-2xs transition-colors">
            {recurringExpenses.map((rec) => (
              <div
                key={rec.id}
                className="p-3 flex items-center justify-between hover:bg-[#FAF9F7] dark:hover:bg-[#1C2C28] transition-colors"
              >
                <div>
                  <p className="text-xs font-bold text-[#1A3636] dark:text-[#F1EFEA] leading-none">{rec.title}</p>
                  <span className="text-[10px] text-[#8B9593] dark:text-[#8C9E99] mt-0.5 block">
                    Her ayın {rec.day_of_month}&apos;i
                  </span>
                </div>

                <div className="flex items-center space-x-2">
                  <span className="text-xs font-black text-[#1A3636] dark:text-[#F1EFEA]">
                    {formatCurrencyTR(rec.amount)}
                  </span>
                  <button
                    onClick={() => deleteRecurringExpense(rec.id)}
                    className="p-1 text-[#C4CDCA] dark:text-[#60736E] hover:text-rose-600 dark:hover:text-rose-400 transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
