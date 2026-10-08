'use client'

import React, { useState } from 'react'
import { useApp } from '@/context/app-context'
import { Users, UserPlus, Copy, Check, ShieldCheck, CheckCircle2, XCircle } from 'lucide-react'
import { formatCurrencyTR, formatDateTR } from '@/lib/installment-engine'

export function SocialFeedView() {
  const {
    currentUser,
    friendships,
    socialFeed,
    sendFriendRequest,
    respondFriendRequest,
  } = useApp()

  const [inputCode, setInputCode] = useState('')
  const [feedback, setFeedback] = useState<{ text: string; isError: boolean } | null>(null)
  const [copied, setCopied] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleCopy = () => {
    if (!currentUser) return
    navigator.clipboard?.writeText(currentUser.user_code)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault()
    setFeedback(null)
    setLoading(true)
    const res = await sendFriendRequest(inputCode)
    setFeedback({ text: res.message, isError: !res.success })
    if (res.success) setInputCode('')
    setLoading(false)
  }

  const acceptedFriends = friendships.filter((f) => f.status === 'accepted')
  const pendingRequests = friendships.filter((f) => f.status === 'pending' && f.isIncoming)

  return (
    <div className="space-y-4 pb-24 px-4 pt-3">
      {/* 1. KULLANICI KODU KARTI (TEK NET SATIR) */}
      <div className="p-4 bg-[#FFFFFF] dark:bg-[#182421] rounded-2xl border border-[#E8E3DD] dark:border-[#263834] shadow-2xs flex items-center justify-between transition-colors">
        <div>
          <span className="text-[11px] text-[#5A6B68] dark:text-[#8C9E99] font-semibold block">
            Senin Kullanıcı Kodun
          </span>
          <span className="font-mono text-xl font-black text-[#1A3636] dark:text-[#F1EFEA] tracking-wider mt-0.5 block">
            {currentUser?.user_code || 'WTR-....'}
          </span>
        </div>
        <button
          onClick={handleCopy}
          className="flex items-center space-x-1.5 px-3 py-2 bg-[#EBF2ED] dark:bg-[#20302C] hover:bg-[#D5E5DA] dark:hover:bg-[#2A3E39] text-[#1A3636] dark:text-[#7EA68E] rounded-xl text-xs font-bold transition-all active:scale-95"
        >
          {copied ? <Check className="w-4 h-4 text-[#678E77] dark:text-[#7EA68E]" /> : <Copy className="w-4 h-4 text-[#5A6B68] dark:text-[#8C9E99]" />}
          <span>{copied ? 'Kopyalandı' : 'Kopyala'}</span>
        </button>
      </div>

      {/* 2. ARKADAŞ EKLE KUTUSU */}
      <div className="p-4 bg-[#FFFFFF] dark:bg-[#182421] rounded-2xl border border-[#E8E3DD] dark:border-[#263834] shadow-2xs space-y-2.5 transition-colors">
        <h3 className="text-xs font-bold text-[#1A3636] dark:text-[#F1EFEA] uppercase tracking-wider">
          Arkadaş Ekle
        </h3>
        <form onSubmit={handleSend} className="flex space-x-2">
          <input
            type="text"
            required
            placeholder="WTR-XXXX"
            value={inputCode}
            onChange={(e) => setInputCode(e.target.value.toUpperCase())}
            className="flex-1 px-3.5 py-2.5 bg-[#FAF9F7] dark:bg-[#131C1A] border border-[#E8E3DD] dark:border-[#263834] focus:border-[#1A3636] dark:focus:border-[#7EA68E] rounded-xl text-sm font-mono font-bold text-[#1A3636] dark:text-[#F1EFEA] uppercase outline-hidden"
          />
          <button
            type="submit"
            disabled={loading}
            className="px-4 py-2.5 bg-[#1A3636] dark:bg-[#7EA68E] hover:bg-[#122525] dark:hover:bg-[#6D947C] text-[#F9F8F6] dark:text-[#0F1715] text-xs font-bold rounded-xl transition-all flex items-center space-x-1 shrink-0 disabled:opacity-50"
          >
            <UserPlus className="w-4 h-4" />
            <span>{loading ? '...' : 'İstek At'}</span>
          </button>
        </form>

        {feedback && (
          <p
            className={`text-xs p-2 rounded-xl ${
              feedback.isError
                ? 'bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-400 border border-rose-200 dark:border-rose-900/40'
                : 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-900/40'
            }`}
          >
            {feedback.text}
          </p>
        )}
      </div>

      {/* 3. BEKLEYEN İSTEKLER (Varsa) */}
      {pendingRequests.length > 0 && (
        <div className="space-y-2">
          <h3 className="text-xs font-bold text-amber-700 dark:text-amber-400 uppercase tracking-wider">
            Gelen İstekler ({pendingRequests.length})
          </h3>
          <div className="space-y-2">
            {pendingRequests.map((req) => (
              <div
                key={req.id}
                className="p-3 bg-[#FFFFFF] dark:bg-[#182421] border border-amber-200 dark:border-amber-900/40 rounded-2xl flex items-center justify-between shadow-2xs transition-colors"
              >
                <div>
                  <p className="text-xs font-bold text-[#1A3636] dark:text-[#F1EFEA]">{req.friendProfile.full_name}</p>
                  <span className="text-[10px] font-mono text-[#8B9593] dark:text-[#8C9E99]">{req.friendProfile.user_code}</span>
                </div>
                <div className="flex space-x-1.5">
                  <button
                    onClick={() => respondFriendRequest(req.id, 'accepted')}
                    className="p-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg transition-colors"
                    title="Kabul Et"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => respondFriendRequest(req.id, 'rejected')}
                    className="p-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded-lg transition-colors"
                    title="Reddet"
                  >
                    <XCircle className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 4. ARKADAŞ LİSTESİ */}
      <div className="space-y-2">
        <h3 className="text-xs font-bold text-[#5A6B68] dark:text-[#8C9E99] uppercase tracking-wider">
          Onaylı Arkadaşlar ({acceptedFriends.length})
        </h3>

        {acceptedFriends.length === 0 ? (
          <div className="p-4 text-center bg-[#FFFFFF] dark:bg-[#182421] rounded-2xl border border-[#E8E3DD] dark:border-[#263834] transition-colors">
            <p className="text-xs text-[#8B9593] dark:text-[#8C9E99]">Henüz eklenmiş bir arkadaşınız yok.</p>
          </div>
        ) : (
          <div className="space-y-2">
            {acceptedFriends.map((f) => (
              <div
                key={f.id}
                className="p-3 bg-[#FFFFFF] dark:bg-[#182421] rounded-2xl border border-[#E8E3DD] dark:border-[#263834] flex items-center justify-between shadow-2xs transition-colors"
              >
                <div className="flex items-center space-x-2.5">
                  <div className="w-8 h-8 rounded-full bg-[#1A3636] dark:bg-[#20302C] text-[#F9F8F6] dark:text-[#7EA68E] font-bold text-xs flex items-center justify-center">
                    {f.friendProfile.full_name?.charAt(0) || 'K'}
                  </div>
                  <div>
                    <p className="text-xs font-bold text-[#1A3636] dark:text-[#F1EFEA] leading-none">
                      {f.friendProfile.full_name}
                    </p>
                    <span className="text-[10px] font-mono text-[#8B9593] dark:text-[#8C9E99] mt-0.5 block">
                      {f.friendProfile.user_code}
                    </span>
                  </div>
                </div>
                <span className="text-[10px] font-bold text-[#678E77] dark:text-[#7EA68E] bg-[#EBF2ED] dark:bg-[#20302C] px-2 py-0.5 rounded-full">
                  Bağlı
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 5. ARKADAŞLARIN HARCAMA AKIŞI (BAKİYELER GİZLİ) */}
      <div className="space-y-2 pt-1">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-bold text-[#5A6B68] dark:text-[#8C9E99] uppercase tracking-wider">
            Arkadaş Harcama Akışı
          </h3>
          <div className="flex items-center space-x-1 text-[10px] text-[#678E77] dark:text-[#7EA68E] font-semibold">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Bakiyeler Gizlidir</span>
          </div>
        </div>

        {socialFeed.length === 0 ? (
          <div className="p-6 text-center bg-[#FFFFFF] dark:bg-[#182421] rounded-2xl border border-[#E8E3DD] dark:border-[#263834] transition-colors">
            <Users className="w-7 h-7 text-[#A8B2AF] dark:text-[#60736E] mx-auto mb-1.5" />
            <p className="text-xs text-[#8B9593] dark:text-[#8C9E99]">Henüz paylaşılan bir arkadaş harcaması yok.</p>
          </div>
        ) : (
          <div className="space-y-2">
            {socialFeed.map((item) => (
              <div
                key={item.transaction_id}
                className="p-3.5 bg-[#FFFFFF] dark:bg-[#182421] rounded-2xl border border-[#E8E3DD] dark:border-[#263834] shadow-2xs flex items-center justify-between transition-colors"
              >
                <div>
                  <div className="flex items-center space-x-1.5">
                    <span className="text-xs font-bold text-[#1A3636] dark:text-[#F1EFEA]">{item.user_name}</span>
                    <span className="text-[10px] font-mono text-[#8B9593] dark:text-[#8C9E99]">({item.user_code})</span>
                  </div>
                  <p className="text-xs text-[#5A6B68] dark:text-[#8C9E99] font-medium mt-0.5">{item.description}</p>
                  <span className="text-[10px] text-[#8B9593] dark:text-[#60736E] block mt-0.5">
                    {formatDateTR(item.transaction_date)} • {item.category}
                  </span>
                </div>

                <div className="text-right">
                  <span className="text-sm font-black text-[#1A3636] dark:text-[#F1EFEA] block">
                    {formatCurrencyTR(item.amount)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
