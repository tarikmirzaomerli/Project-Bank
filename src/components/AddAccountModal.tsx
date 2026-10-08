'use client'

import React, { useState } from 'react'
import { useApp } from '@/context/app-context'
import { X, Check, CreditCard, Landmark } from 'lucide-react'
import { TURKISH_BANKS } from '@/types'

export function AddAccountModal() {
  const { isAddCardOpen, setIsAddCardOpen, addCard } = useApp()

  const [type, setType] = useState<'credit_card' | 'bank'>('credit_card')
  const [bankName, setBankName] = useState<string>(TURKISH_BANKS[0].name)
  const [name, setName] = useState<string>('')
  const [balance, setBalance] = useState<string>('')
  const [creditLimit, setCreditLimit] = useState<string>('')
  const [cutoffDay, setCutoffDay] = useState<number>(15)
  const [dueDay, setDueDay] = useState<number>(25)

  if (!isAddCardOpen) return null

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const numBalance = parseFloat(balance) || 0
    const numLimit = parseFloat(creditLimit) || 0

    const cardName = name.trim() || `${bankName} ${type === 'credit_card' ? 'Kredi Kartı' : 'Kartı'}`

    addCard({
      name: cardName,
      bank_name: bankName,
      type,
      balance: numBalance,
      credit_limit: type === 'credit_card' ? numLimit : 0,
      cutoff_day: type === 'credit_card' ? cutoffDay : undefined,
      due_day: type === 'credit_card' ? dueDay : undefined,
    })

    // Reset and close
    setName('')
    setBalance('')
    setCreditLimit('')
    setIsAddCardOpen(false)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/50 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="w-full max-w-md bg-[#FAF9F7] dark:bg-[#182421] rounded-t-3xl sm:rounded-3xl shadow-2xl border border-[#E8E3DD] dark:border-[#263834] max-h-[92vh] flex flex-col overflow-hidden animate-in slide-in-from-bottom duration-300 transition-colors">
        <div className="p-4 border-b border-[#E8E3DD] dark:border-[#263834] flex items-center justify-between bg-[#FFFFFF] dark:bg-[#182421] transition-colors">
          <h2 className="font-bold text-base text-[#1A3636] dark:text-[#F1EFEA]">Yeni Kart Tanımla</h2>
          <button
            onClick={() => setIsAddCardOpen(false)}
            className="p-1 rounded-full text-[#8B9593] dark:text-[#8C9E99] hover:text-[#1A3636] dark:hover:text-[#F1EFEA] hover:bg-[#F2EFEA] dark:hover:bg-[#20302C] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-4 space-y-4 overflow-y-auto max-h-[calc(92vh-120px)]">
          {/* Kart Türü */}
          <div>
            <label className="block text-xs font-semibold text-[#5A6B68] dark:text-[#8C9E99] mb-1.5">Kart Türü</label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setType('credit_card')}
                className={`py-2 px-3 rounded-xl text-xs font-bold flex items-center justify-center space-x-1.5 transition-all ${
                  type === 'credit_card'
                    ? 'bg-[#1A3636] dark:bg-[#7EA68E] text-[#F9F8F6] dark:text-[#0F1715] shadow-xs'
                    : 'bg-[#FFFFFF] dark:bg-[#131C1A] border border-[#E8E3DD] dark:border-[#263834] text-[#5A6B68] dark:text-[#8C9E99]'
                }`}
              >
                <CreditCard className="w-4 h-4" />
                <span>Kredi Kartı</span>
              </button>

              <button
                type="button"
                onClick={() => setType('bank')}
                className={`py-2 px-3 rounded-xl text-xs font-bold flex items-center justify-center space-x-1.5 transition-all ${
                  type === 'bank'
                    ? 'bg-[#1A3636] dark:bg-[#7EA68E] text-[#F9F8F6] dark:text-[#0F1715] shadow-xs'
                    : 'bg-[#FFFFFF] dark:bg-[#131C1A] border border-[#E8E3DD] dark:border-[#263834] text-[#5A6B68] dark:text-[#8C9E99]'
                }`}
              >
                <Landmark className="w-4 h-4" />
                <span>Banka / Maaş Kartı</span>
              </button>
            </div>
          </div>

          {/* Banka Seçimi */}
          <div>
            <label className="block text-xs font-semibold text-[#5A6B68] dark:text-[#8C9E99] mb-1">Banka</label>
            <select
              value={bankName}
              onChange={(e) => setBankName(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-[#FFFFFF] dark:bg-[#131C1A] border border-[#E8E3DD] dark:border-[#263834] focus:border-[#1A3636] dark:focus:border-[#7EA68E] rounded-xl text-sm font-semibold text-[#1A3636] dark:text-[#F1EFEA] outline-hidden"
            >
              {TURKISH_BANKS.map((b) => (
                <option key={b.id} value={b.name}>
                  {b.name}
                </option>
              ))}
            </select>
          </div>

          {/* Kart İsmi */}
          <div>
            <label className="block text-xs font-semibold text-[#5A6B68] dark:text-[#8C9E99] mb-1">
              Kart Adı
            </label>
            <input
              type="text"
              required
              placeholder="Örn: Bonus Genç, Axess, Maximum..."
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-[#FFFFFF] dark:bg-[#131C1A] border border-[#E8E3DD] dark:border-[#263834] focus:border-[#1A3636] dark:focus:border-[#7EA68E] rounded-xl text-sm text-[#1A3636] dark:text-[#F1EFEA] outline-hidden font-medium"
            />
          </div>

          {/* Kredi Kartı Detayları */}
          {type === 'credit_card' ? (
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-[#5A6B68] dark:text-[#8C9E99] mb-1">
                    Kart Limiti (₺)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    placeholder="50000"
                    value={creditLimit}
                    onChange={(e) => setCreditLimit(e.target.value)}
                    className="w-full px-3 py-2 bg-[#FFFFFF] dark:bg-[#131C1A] border border-[#E8E3DD] dark:border-[#263834] rounded-xl text-sm font-bold text-[#1A3636] dark:text-[#F1EFEA] outline-hidden"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#5A6B68] dark:text-[#8C9E99] mb-1">
                    Güncel Borç (₺)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    placeholder="0"
                    value={balance}
                    onChange={(e) => setBalance(e.target.value)}
                    className="w-full px-3 py-2 bg-[#FFFFFF] dark:bg-[#131C1A] border border-[#E8E3DD] dark:border-[#263834] rounded-xl text-sm font-bold text-rose-700 dark:text-rose-400 outline-hidden"
                  />
                </div>
              </div>

              {/* Ekstre Kesim ve Son Ödeme Günü */}
              <div className="p-3 bg-[#EBF2ED] dark:bg-[#20302C] rounded-xl border border-[#678E77]/30 dark:border-[#2E4A42] grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-[#1A3636] dark:text-[#F1EFEA] mb-1">
                    Ekstre Kesim Günü
                  </label>
                  <select
                    value={cutoffDay}
                    onChange={(e) => setCutoffDay(parseInt(e.target.value, 10))}
                    className="w-full p-2 bg-[#FFFFFF] dark:bg-[#131C1A] border border-[#678E77]/30 dark:border-[#263834] rounded-lg text-xs font-bold text-[#1A3636] dark:text-[#F1EFEA]"
                  >
                    {Array.from({ length: 31 }, (_, i) => i + 1).map((d) => (
                      <option key={d} value={d}>
                        Her ayın {d}&apos;si
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-[#1A3636] dark:text-[#F1EFEA] mb-1">
                    Son Ödeme Günü
                  </label>
                  <select
                    value={dueDay}
                    onChange={(e) => setDueDay(parseInt(e.target.value, 10))}
                    className="w-full p-2 bg-[#FFFFFF] dark:bg-[#131C1A] border border-[#678E77]/30 dark:border-[#263834] rounded-lg text-xs font-bold text-[#1A3636] dark:text-[#F1EFEA]"
                  >
                    {Array.from({ length: 31 }, (_, i) => i + 1).map((d) => (
                      <option key={d} value={d}>
                        Her ayın {d}&apos;si
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          ) : (
            <div>
              <label className="block text-xs font-semibold text-[#5A6B68] dark:text-[#8C9E99] mb-1">
                Mevcut Bakiye (₺)
              </label>
              <input
                type="number"
                step="0.01"
                placeholder="0"
                value={balance}
                onChange={(e) => setBalance(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-[#FFFFFF] dark:bg-[#131C1A] border border-[#E8E3DD] dark:border-[#263834] rounded-xl text-sm font-bold text-[#1A3636] dark:text-[#F1EFEA] outline-hidden"
              />
            </div>
          )}

          <button
            type="submit"
            className="w-full py-3 bg-[#1A3636] dark:bg-[#7EA68E] hover:bg-[#122525] dark:hover:bg-[#6D947C] text-[#F9F8F6] dark:text-[#0F1715] font-bold text-sm rounded-xl shadow-md transition-all flex items-center justify-center space-x-1.5"
          >
            <Check className="w-4 h-4" />
            <span>Kartı Kaydet</span>
          </button>
        </form>
      </div>
    </div>
  )
}
