'use client'

import React from 'react'
import { useApp } from '@/context/app-context'
import {
  Wallet,
  CreditCard,
  Plus,
  Trash2,
  ChevronRight,
  Layers,
} from 'lucide-react'
import { formatCurrencyTR, formatDateTR } from '@/lib/installment-engine'

export function DashboardView() {
  const {
    totalCash,
    totalCreditDebt,
    nextMonthForecast,
    cards,
    transactions,
    setActiveTab,
    setIsAddCardOpen,
    setIsAddModalOpen,
    deleteCard,
    deleteTransaction,
  } = useApp()

  const isCompletelyEmpty = cards.length === 0 && transactions.length === 0 && totalCash === 0

  return (
    <div className="space-y-4 pb-24 px-4 pt-3">
      {/* 1. BLOK: TOPLAM NAKİT VE TOPLAM KART BORCU (2 SADE KUTUCUK) */}
      <div className="grid grid-cols-2 gap-3">
        {/* Toplam Nakit */}
        <div className="bg-[#FFFFFF] dark:bg-[#182421] p-3.5 rounded-2xl border border-[#E8E3DD] dark:border-[#263834] shadow-2xs transition-colors">
          <div className="flex items-center space-x-1.5 text-[#5A6B68] dark:text-[#8C9E99] text-xs font-semibold mb-1">
            <Wallet className="w-3.5 h-3.5 text-[#2E7D32] dark:text-[#7EA68E]" />
            <span>Toplam Nakit</span>
          </div>
          <div className={`text-lg font-extrabold tracking-tight ${totalCash < 0 ? 'text-rose-700 dark:text-rose-400' : 'text-[#1A3636] dark:text-[#F1EFEA]'}`}>
            {formatCurrencyTR(totalCash)}
          </div>
        </div>

        {/* Toplam Kart Borcu */}
        <div className="bg-[#FFFFFF] dark:bg-[#182421] p-3.5 rounded-2xl border border-[#E8E3DD] dark:border-[#263834] shadow-2xs transition-colors">
          <div className="flex items-center space-x-1.5 text-[#5A6B68] dark:text-[#8C9E99] text-xs font-semibold mb-1">
            <CreditCard className="w-3.5 h-3.5 text-rose-600 dark:text-rose-400" />
            <span>Toplam Kart Borcu</span>
          </div>
          <div className="text-lg font-extrabold text-rose-700 dark:text-rose-400 tracking-tight">
            -{formatCurrencyTR(totalCreditDebt)}
          </div>
        </div>
      </div>

      {/* 2. BLOK: GELECEK AY TAKSİT YÜKÜ (SADE VURGU KARTI) */}
      <div className="bg-[#1A3636] dark:bg-[#1A2E28] border border-transparent dark:border-[#2E4A42] text-[#F9F8F6] dark:text-[#F1EFEA] p-4 rounded-2xl shadow-sm flex items-center justify-between transition-colors">
        <div>
          <span className="text-[11px] text-[#A8B2AF] dark:text-[#8C9E99] font-bold uppercase tracking-wider block">
            Önümüzdeki Ay Ödenecek ({nextMonthForecast.targetMonthLabel})
          </span>
          <div className="text-2xl font-black tracking-tight text-[#FFFFFF] dark:text-[#F1EFEA] mt-0.5">
            {formatCurrencyTR(nextMonthForecast.totalForecast)}
          </div>
        </div>
        <button
          onClick={() => setActiveTab('installments')}
          className="px-3 py-1.5 bg-[#FFFFFF]/15 dark:bg-[#FFFFFF]/10 hover:bg-[#FFFFFF]/25 text-[#FFFFFF] dark:text-[#F1EFEA] rounded-xl text-xs font-bold flex items-center space-x-1 transition-all"
        >
          <span>Taksitler</span>
          <ChevronRight className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* SIFIR HESAP HOŞ GELDİN ALANI (Eğer hesap bomboşsa) */}
      {isCompletelyEmpty && (
        <div className="p-6 text-center bg-[#FFFFFF] dark:bg-[#182421] rounded-2xl border border-dashed border-[#E8E3DD] dark:border-[#263834] space-y-3 transition-colors">
          <Layers className="w-8 h-8 text-[#A8B2AF] dark:text-[#60736E] mx-auto" />
          <div>
            <h3 className="text-sm font-bold text-[#1A3636] dark:text-[#F1EFEA]">Hesabınız Hazır!</h3>
            <p className="text-xs text-[#5A6B68] dark:text-[#8C9E99] mt-0.5">
              Takibe başlamak için hemen bir kart tanımlayın veya nakit tutar girin.
            </p>
          </div>
          <div className="flex justify-center space-x-2 pt-1">
            <button
              onClick={() => setIsAddCardOpen(true)}
              className="px-3.5 py-2 bg-[#1A3636] dark:bg-[#7EA68E] text-[#FFFFFF] dark:text-[#0F1715] rounded-xl text-xs font-bold hover:bg-[#122525] dark:hover:bg-[#6D947C] transition-all"
            >
              + Kart Ekle
            </button>
            <button
              onClick={() => setIsAddModalOpen(true)}
              className="px-3.5 py-2 bg-[#EBF2ED] dark:bg-[#20302C] text-[#1A3636] dark:text-[#F1EFEA] rounded-xl text-xs font-bold hover:bg-[#D4E5D8] dark:hover:bg-[#2A3E39] transition-all"
            >
              + Nakit Ekle
            </button>
          </div>
        </div>
      )}

      {/* 3. BLOK: TANIMLI KARTLARIM VE SON HARCAMALAR */}
      {/* 3A: Tanımlı Kartlarım */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-bold text-[#5A6B68] dark:text-[#8C9E99] uppercase tracking-wider">
            Tanımlı Kartlarım ({cards.length})
          </h3>
          <button
            onClick={() => setIsAddCardOpen(true)}
            className="text-xs font-bold text-[#1A3636] dark:text-[#7EA68E] hover:underline flex items-center space-x-1"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Kart Ekle</span>
          </button>
        </div>

        {cards.length === 0 ? (
          <div className="p-4 text-center bg-[#FFFFFF] dark:bg-[#182421] rounded-2xl border border-[#E8E3DD] dark:border-[#263834] transition-colors">
            <p className="text-xs text-[#8B9593] dark:text-[#8C9E99]">Tanımlı kart bulunmuyor.</p>
          </div>
        ) : (
          <div className="space-y-2">
            {cards.map((c) => (
              <div
                key={c.id}
                className="p-3 bg-[#FFFFFF] dark:bg-[#182421] rounded-2xl border border-[#E8E3DD] dark:border-[#263834] flex items-center justify-between shadow-2xs transition-colors"
              >
                <div className="flex items-center space-x-2.5">
                  <div className="w-8 h-8 rounded-xl bg-[#F4F1EA] dark:bg-[#20302C] text-[#1A3636] dark:text-[#7EA68E] flex items-center justify-center font-bold text-xs">
                    <CreditCard className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-[#1A3636] dark:text-[#F1EFEA] leading-none">
                      {c.name}
                    </p>
                    <span className="text-[10px] text-[#8B9593] dark:text-[#8C9E99] mt-0.5 block">
                      {c.bank_name || 'Banka'} • {c.type === 'credit_card' ? 'Kredi Kartı' : 'Banka Kartı'}
                      {c.cutoff_day ? ` • Ekstre: ${c.cutoff_day}'i` : ''}
                    </span>
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  <div className="text-right">
                    <span className={`text-xs font-black block ${c.type === 'credit_card' ? 'text-rose-700 dark:text-rose-400' : 'text-[#2E7D32] dark:text-[#7EA68E]'}`}>
                      {c.type === 'credit_card' ? `-${formatCurrencyTR(Math.abs(c.balance))}` : formatCurrencyTR(c.balance)}
                    </span>
                    {c.credit_limit ? (
                      <span className="text-[9px] text-[#8B9593] dark:text-[#8C9E99] block">
                        Limit: ₺{c.credit_limit.toLocaleString('tr-TR')}
                      </span>
                    ) : null}
                  </div>
                  <button
                    onClick={() => deleteCard(c.id)}
                    className="p-1 text-[#C4CDCA] dark:text-[#60736E] hover:text-rose-600 dark:hover:text-rose-400 transition-colors"
                    title="Kartı Sil"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 3B: Son Harcamalar */}
      <div className="space-y-2 pt-1">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-bold text-[#5A6B68] dark:text-[#8C9E99] uppercase tracking-wider">
            Son Harcamalar ({transactions.length})
          </h3>
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="text-xs font-bold text-[#678E77] dark:text-[#7EA68E] hover:underline"
          >
            + Harcama Gir
          </button>
        </div>

        {transactions.length === 0 ? (
          <div className="p-4 text-center bg-[#FFFFFF] dark:bg-[#182421] rounded-2xl border border-[#E8E3DD] dark:border-[#263834] transition-colors">
            <p className="text-xs text-[#8B9593] dark:text-[#8C9E99]">Henüz harcama kaydı yok.</p>
          </div>
        ) : (
          <div className="bg-[#FFFFFF] dark:bg-[#182421] rounded-2xl border border-[#E8E3DD] dark:border-[#263834] divide-y divide-[#E8E3DD]/60 dark:divide-[#263834]/60 overflow-hidden shadow-2xs transition-colors">
            {transactions.slice(0, 8).map((tx) => (
              <div
                key={tx.id}
                className="p-3 flex items-center justify-between hover:bg-[#FAF9F7] dark:hover:bg-[#1C2C28] transition-colors"
              >
                <div>
                  <p className="text-xs font-bold text-[#1A3636] dark:text-[#F1EFEA] leading-none">
                    {tx.description}
                  </p>
                  <span className="text-[10px] text-[#8B9593] dark:text-[#8C9E99] mt-0.5 block">
                    {formatDateTR(tx.transaction_date)} • {tx.category}
                  </span>
                </div>

                <div className="flex items-center space-x-2">
                  <span className={`text-xs font-black ${tx.description.startsWith('[+]') ? 'text-[#2E7D32] dark:text-[#7EA68E]' : 'text-[#1A3636] dark:text-[#F1EFEA]'}`}>
                    {tx.description.startsWith('[+]') ? `+${formatCurrencyTR(tx.amount)}` : `-${formatCurrencyTR(tx.amount)}`}
                  </span>
                  <button
                    onClick={() => deleteTransaction(tx.id)}
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
