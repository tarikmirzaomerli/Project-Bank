'use client'

import React, { useState } from 'react'
import { useApp } from '@/context/app-context'
import { X, Wallet, CreditCard, Calendar, CheckCircle2 } from 'lucide-react'
import { EXPENSE_CATEGORIES } from '@/types'

export function QuickAddModal() {
  const {
    isAddModalOpen,
    setIsAddModalOpen,
    cards,
    updateCashBalance,
    addCardTransaction,
    addRecurringExpense,
    setIsAddCardOpen,
  } = useApp()

  const [activeTab, setActiveTab] = useState<'cash' | 'card' | 'recurring'>('cash')

  // Ortak Alanlar
  const [amount, setAmount] = useState('')
  const [description, setDescription] = useState('')
  const [category, setCategory] = useState<string>(EXPENSE_CATEGORIES[0])

  // 1. Nakit Alanları
  const [cashType, setCashType] = useState<'expense' | 'income'>('expense')

  // 2. Kart Alanları
  const [selectedCardId, setSelectedCardId] = useState<string>('')
  const [installmentCount, setInstallmentCount] = useState<number>(1) // 1 = Tek Çekim

  // 3. Sabit Gider Alanları
  const [dayOfMonth, setDayOfMonth] = useState<number>(1)

  // İlk kartı varsayılan seç
  React.useEffect(() => {
    if (cards.length > 0 && !selectedCardId) {
      setSelectedCardId(cards[0].id)
    }
  }, [cards, selectedCardId])

  if (!isAddModalOpen) return null

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const numAmount = parseFloat(amount)
    if (isNaN(numAmount) || numAmount <= 0) return
    if (!description.trim()) return

    if (activeTab === 'cash') {
      updateCashBalance(numAmount, cashType, description.trim(), category)
    } else if (activeTab === 'card') {
      if (!selectedCardId) return
      addCardTransaction({
        card_id: selectedCardId,
        amount: numAmount,
        description: description.trim(),
        category,
        installment_count: installmentCount,
      })
    } else if (activeTab === 'recurring') {
      addRecurringExpense({
        title: description.trim(),
        amount: numAmount,
        day_of_month: Number(dayOfMonth),
      })
    }

    // Reset ve kapat
    setAmount('')
    setDescription('')
    setIsAddModalOpen(false)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/50 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="w-full max-w-md bg-[#FAF9F7] dark:bg-[#182421] rounded-t-3xl sm:rounded-3xl shadow-2xl border border-[#E8E3DD] dark:border-[#263834] max-h-[92vh] flex flex-col overflow-hidden animate-in slide-in-from-bottom duration-300 transition-colors">
        {/* Üst Bar & 3 Basit Seçenek */}
        <div className="p-4 border-b border-[#E8E3DD] dark:border-[#263834] bg-[#FFFFFF] dark:bg-[#182421] transition-colors">
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-bold text-base text-[#1A3636] dark:text-[#F1EFEA]">Hızlı Ekle</h2>
            <button
              onClick={() => setIsAddModalOpen(false)}
              className="p-1 rounded-full text-[#8B9593] dark:text-[#8C9E99] hover:text-[#1A3636] dark:hover:text-[#F1EFEA] hover:bg-[#F2EFEA] dark:hover:bg-[#20302C] transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="grid grid-cols-3 gap-1.5 p-1 bg-[#F4F1EA] dark:bg-[#121C1A] rounded-xl text-xs font-bold transition-colors">
            <button
              type="button"
              onClick={() => setActiveTab('cash')}
              className={`py-2 rounded-lg flex items-center justify-center space-x-1 transition-all ${
                activeTab === 'cash'
                  ? 'bg-[#1A3636] dark:bg-[#7EA68E] text-[#F9F8F6] dark:text-[#0F1715] shadow-xs'
                  : 'text-[#5A6B68] dark:text-[#8C9E99] hover:text-[#1A3636] dark:hover:text-[#F1EFEA]'
              }`}
            >
              <Wallet className="w-3.5 h-3.5" />
              <span>Nakit</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('card')}
              className={`py-2 rounded-lg flex items-center justify-center space-x-1 transition-all ${
                activeTab === 'card'
                  ? 'bg-[#1A3636] dark:bg-[#7EA68E] text-[#F9F8F6] dark:text-[#0F1715] shadow-xs'
                  : 'text-[#5A6B68] dark:text-[#8C9E99] hover:text-[#1A3636] dark:hover:text-[#F1EFEA]'
              }`}
            >
              <CreditCard className="w-3.5 h-3.5" />
              <span>Kart</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('recurring')}
              className={`py-2 rounded-lg flex items-center justify-center space-x-1 transition-all ${
                activeTab === 'recurring'
                  ? 'bg-[#1A3636] dark:bg-[#7EA68E] text-[#F9F8F6] dark:text-[#0F1715] shadow-xs'
                  : 'text-[#5A6B68] dark:text-[#8C9E99] hover:text-[#1A3636] dark:hover:text-[#F1EFEA]'
              }`}
            >
              <Calendar className="w-3.5 h-3.5" />
              <span>Sabit Gider</span>
            </button>
          </div>
        </div>

        {/* Form Alanları */}
        <form onSubmit={handleSubmit} className="p-4 space-y-4 overflow-y-auto max-h-[calc(92vh-130px)]">
          {/* 1. SEÇENEK: NAKİT HARCAMA / GELİR */}
          {activeTab === 'cash' && (
            <div className="flex rounded-xl bg-[#FFFFFF] dark:bg-[#131C1A] p-1 border border-[#E8E3DD] dark:border-[#263834] transition-colors">
              <button
                type="button"
                onClick={() => setCashType('expense')}
                className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  cashType === 'expense'
                    ? 'bg-rose-700 text-white shadow-2xs'
                    : 'text-[#5A6B68] dark:text-[#8C9E99]'
                }`}
              >
                [-] Nakit Harcama
              </button>
              <button
                type="button"
                onClick={() => setCashType('income')}
                className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  cashType === 'income'
                    ? 'bg-[#2E7D32] dark:bg-[#7EA68E] text-white dark:text-[#0F1715] shadow-2xs'
                    : 'text-[#5A6B68] dark:text-[#8C9E99]'
                }`}
              >
                [+] Nakit Gelir
              </button>
            </div>
          )}

          {/* 2. SEÇENEK: KREDİ KARTI SEÇİMİ */}
          {activeTab === 'card' && (
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-semibold text-[#5A6B68] dark:text-[#8C9E99]">Hangi Kart?</label>
                <button
                  type="button"
                  onClick={() => setIsAddCardOpen(true)}
                  className="text-[11px] text-[#678E77] dark:text-[#7EA68E] hover:underline font-bold"
                >
                  + Yeni Kart Ekle
                </button>
              </div>

              {cards.length === 0 ? (
                <div className="p-3 bg-[#FFFFFF] dark:bg-[#131C1A] border border-dashed border-[#E8E3DD] dark:border-[#263834] rounded-xl text-center">
                  <p className="text-xs text-[#5A6B68] dark:text-[#8C9E99]">Tanımlı kartınız bulunmuyor.</p>
                  <button
                    type="button"
                    onClick={() => setIsAddCardOpen(true)}
                    className="text-xs text-[#1A3636] dark:text-[#7EA68E] font-bold underline mt-1"
                  >
                    Hemen Kart Tanımla
                  </button>
                </div>
              ) : (
                <select
                  value={selectedCardId}
                  onChange={(e) => setSelectedCardId(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-[#FFFFFF] dark:bg-[#131C1A] border border-[#E8E3DD] dark:border-[#263834] focus:border-[#1A3636] dark:focus:border-[#7EA68E] rounded-xl text-sm font-semibold text-[#1A3636] dark:text-[#F1EFEA] outline-hidden"
                >
                  {cards.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name} ({c.bank_name || 'Banka'}) {c.cutoff_day ? `- Ekstre: ${c.cutoff_day}'i` : ''}
                    </option>
                  ))}
                </select>
              )}
            </div>
          )}

          {/* TUTAR */}
          <div>
            <label className="block text-xs font-semibold text-[#5A6B68] dark:text-[#8C9E99] mb-1">
              Tutar (₺)
            </label>
            <div className="relative">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-lg font-bold text-[#1A3636] dark:text-[#7EA68E]">
                ₺
              </span>
              <input
                type="number"
                step="0.01"
                min="0.01"
                required
                placeholder="0.00"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-full pl-9 pr-4 py-2.5 bg-[#FFFFFF] dark:bg-[#131C1A] border border-[#E8E3DD] dark:border-[#263834] focus:border-[#1A3636] dark:focus:border-[#7EA68E] rounded-xl text-lg font-bold text-[#1A3636] dark:text-[#F1EFEA] outline-hidden"
              />
            </div>
          </div>

          {/* KART HARCAMASI İÇİN TAKSİT SEÇİMİ */}
          {activeTab === 'card' && (
            <div>
              <label className="block text-xs font-semibold text-[#5A6B68] dark:text-[#8C9E99] mb-1.5">
                Taksit Sayısı
              </label>
              <div className="grid grid-cols-6 gap-1">
                {[
                  { count: 1, label: 'Tek Çekim' },
                  { count: 2, label: '2 Taksit' },
                  { count: 3, label: '3 Taksit' },
                  { count: 6, label: '6 Taksit' },
                  { count: 9, label: '9 Taksit' },
                  { count: 12, label: '12 Taksit' },
                ].map((item) => (
                  <button
                    key={item.count}
                    type="button"
                    onClick={() => setInstallmentCount(item.count)}
                    className={`py-2 rounded-xl text-[11px] font-bold transition-all text-center ${
                      installmentCount === item.count
                        ? 'bg-[#1A3636] dark:bg-[#7EA68E] text-[#F9F8F6] dark:text-[#0F1715] shadow-xs'
                        : 'bg-[#FFFFFF] dark:bg-[#131C1A] border border-[#E8E3DD] dark:border-[#263834] text-[#5A6B68] dark:text-[#8C9E99]'
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* 3. SABİT GİDER: AYIN HANGİ GÜNÜ */}
          {activeTab === 'recurring' && (
            <div>
              <label className="block text-xs font-semibold text-[#5A6B68] dark:text-[#8C9E99] mb-1">
                Ödeme Günü (Ayın kaçında ödenecek?)
              </label>
              <select
                value={dayOfMonth}
                onChange={(e) => setDayOfMonth(parseInt(e.target.value, 10))}
                className="w-full px-3.5 py-2.5 bg-[#FFFFFF] dark:bg-[#131C1A] border border-[#E8E3DD] dark:border-[#263834] rounded-xl text-sm font-semibold text-[#1A3636] dark:text-[#F1EFEA]"
              >
                {Array.from({ length: 31 }, (_, i) => i + 1).map((d) => (
                  <option key={d} value={d}>
                    Her ayın {d}&apos;inci günü
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* AÇIKLAMA */}
          <div>
            <label className="block text-xs font-semibold text-[#5A6B68] dark:text-[#8C9E99] mb-1">
              Açıklama
            </label>
            <input
              type="text"
              required
              placeholder={
                activeTab === 'cash'
                  ? 'Örn: Pazar alışverişi, Nakit harcama...'
                  : activeTab === 'recurring'
                  ? 'Örn: Ev Kirası, Aidat, Netflix...'
                  : 'Örn: Kışlık Mont, Restoran...'
              }
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-[#FFFFFF] dark:bg-[#131C1A] border border-[#E8E3DD] dark:border-[#263834] focus:border-[#1A3636] dark:focus:border-[#7EA68E] rounded-xl text-sm text-[#1A3636] dark:text-[#F1EFEA] outline-hidden font-medium"
            />
          </div>

          {/* KATEGORİ (Nakit ve Kart için) */}
          {activeTab !== 'recurring' && (
            <div>
              <label className="block text-xs font-semibold text-[#5A6B68] dark:text-[#8C9E99] mb-1">
                Kategori
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-3.5 py-2 bg-[#FFFFFF] dark:bg-[#131C1A] border border-[#E8E3DD] dark:border-[#263834] rounded-xl text-xs font-semibold text-[#1A3636] dark:text-[#F1EFEA]"
              >
                {EXPENSE_CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* SUBMIT BUTTON */}
          <button
            type="submit"
            className="w-full py-3 bg-[#1A3636] dark:bg-[#7EA68E] hover:bg-[#122525] dark:hover:bg-[#6D947C] text-[#F9F8F6] dark:text-[#0F1715] font-bold text-sm rounded-xl shadow-md transition-all flex items-center justify-center space-x-1.5"
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>Kaydet</span>
          </button>
        </form>
      </div>
    </div>
  )
}
