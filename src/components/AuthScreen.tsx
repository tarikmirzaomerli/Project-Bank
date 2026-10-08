'use client'

import React, { useState } from 'react'
import { useApp } from '@/context/app-context'
import { isSupabaseConfigured, supabaseSignIn, supabaseSignUp } from '@/lib/supabase/service'
import { LogIn, UserPlus, AlertCircle, Sparkles, CheckCircle2, ShieldCheck } from 'lucide-react'
import { ThemeToggle } from '@/components/ThemeToggle'
import { TEST_ADMIN_USER } from '@/lib/constants'

export function AuthScreen() {
  const { setLoggedInUser } = useApp()
  const [isSignUp, setIsSignUp] = useState(false)
  const [identifier, setIdentifier] = useState('')
  const [password, setPassword] = useState('')
  const [fullName, setFullName] = useState('')
  const [errorMsg, setErrorMsg] = useState<string | null>(null)
  const [successMsg, setSuccessMsg] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  // Doğrudan Yönetici / Test Hesabı ile Giriş Yap
  const handleTestLogin = () => {
    setErrorMsg(null)
    setSuccessMsg('Yönetici / Test hesabı ile giriş yapıldı!')
    setLoggedInUser(TEST_ADMIN_USER)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrorMsg(null)
    setSuccessMsg(null)
    setLoading(true)

    const cleanIdentifier = identifier.trim().toLowerCase()

    // 1. Yönetici / Test hesabı bypass kontrolü (kullanıcı adı: test / şifre: test)
    if (
      !isSignUp &&
      (cleanIdentifier === 'test' || cleanIdentifier === 'test@paratakip.local') &&
      password.trim() === 'test'
    ) {
      handleTestLogin()
      setLoading(false)
      return
    }

    if (isSignUp && password.length < 6) {
      setErrorMsg('Şifre en az 6 karakter olmalıdır.')
      setLoading(false)
      return
    }

    const configured = isSupabaseConfigured()

    if (!configured) {
      // Supabase .env.local henüz tanımlanmadıysa lokal oturum açılır
      const dummyId = `usr-${Date.now()}`
      setLoggedInUser({
        id: dummyId,
        user_code: 'WTR-' + Math.random().toString(36).substring(2, 6).toUpperCase(),
        full_name: fullName.trim() || identifier.split('@')[0] || 'Kullanıcı',
        email: identifier.trim(),
        avatar_url: null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      setLoading(false)
      return
    }

    try {
      if (isSignUp) {
        const { data, error } = await supabaseSignUp(identifier.trim(), password, fullName)
        if (error) {
          setErrorMsg(error.message)
        } else if (data.user) {
          setSuccessMsg('Kayıt başarılı! Giriş yapılıyor...')
          setLoggedInUser({
            id: data.user.id,
            user_code: 'WTR-' + Math.random().toString(36).substring(2, 6).toUpperCase(),
            full_name: fullName.trim() || identifier.split('@')[0],
            email: identifier.trim(),
            avatar_url: null,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          })
        }
      } else {
        const { data, error } = await supabaseSignIn(identifier.trim(), password)
        if (error) {
          setErrorMsg(error.message)
        } else if (data.user) {
          setLoggedInUser({
            id: data.user.id,
            user_code: 'WTR-' + Math.random().toString(36).substring(2, 6).toUpperCase(),
            full_name: data.user.user_metadata?.full_name || identifier.split('@')[0],
            email: identifier.trim(),
            avatar_url: null,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          })
        }
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Giriş yapılırken bir hata oluştu.')
    } finally {
      setLoading(false)
    }
  }

  // Hızlı Demo Girişi (Yeni Kullanıcı)
  const handleQuickDemo = () => {
    setLoggedInUser({
      id: `usr-demo-${Date.now()}`,
      user_code: 'WTR-' + Math.random().toString(36).substring(2, 6).toUpperCase(),
      full_name: 'Yeni Kullanıcı',
      email: 'demo@paratakip.app',
      avatar_url: null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
  }

  return (
    <div className="min-h-screen flex flex-col justify-center px-5 py-8 bg-[#F9F8F6] dark:bg-[#0F1715] transition-colors relative">
      {/* Top Corner Theme Toggle */}
      <div className="absolute top-4 right-4">
        <ThemeToggle />
      </div>

      <div className="w-full max-w-sm mx-auto space-y-6">
        {/* App Branding */}
        <div className="text-center space-y-1.5">
          <div className="w-12 h-12 rounded-2xl bg-[#1A3636] dark:bg-[#1E332E] border border-transparent dark:border-[#263834] flex items-center justify-center text-[#F9F8F6] dark:text-[#7EA68E] font-extrabold text-xl mx-auto shadow-md">
            <span>₺</span>
          </div>
          <h1 className="text-2xl font-black text-[#1A3636] dark:text-[#F1EFEA] tracking-tight">
            ParaTakip
          </h1>
          <p className="text-xs text-[#5A6B68] dark:text-[#8C9E99]">
            Kişisel Muhasebe & Taksit Takip PWA
          </p>
        </div>

        {/* Auth Card */}
        <div className="bg-[#FFFFFF] dark:bg-[#182421] p-6 rounded-3xl border border-[#E8E3DD] dark:border-[#263834] shadow-sm space-y-5 transition-colors">
          {/* Tabs */}
          <div className="grid grid-cols-2 p-1 bg-[#F4F1EA] dark:bg-[#121C1A] rounded-xl text-xs font-bold transition-colors">
            <button
              type="button"
              onClick={() => {
                setIsSignUp(false)
                setErrorMsg(null)
              }}
              className={`py-2 rounded-lg transition-all ${
                !isSignUp
                  ? 'bg-[#1A3636] dark:bg-[#7EA68E] text-[#F9F8F6] dark:text-[#0F1715] shadow-xs'
                  : 'text-[#5A6B68] dark:text-[#8C9E99] hover:text-[#1A3636] dark:hover:text-[#F1EFEA]'
              }`}
            >
              Giriş Yap
            </button>
            <button
              type="button"
              onClick={() => {
                setIsSignUp(true)
                setErrorMsg(null)
              }}
              className={`py-2 rounded-lg transition-all ${
                isSignUp
                  ? 'bg-[#1A3636] dark:bg-[#7EA68E] text-[#F9F8F6] dark:text-[#0F1715] shadow-xs'
                  : 'text-[#5A6B68] dark:text-[#8C9E99] hover:text-[#1A3636] dark:hover:text-[#F1EFEA]'
              }`}
            >
              Kayıt Ol
            </button>
          </div>

          {/* Test / Yönetici Hesabı Hızlı Giriş Butonu */}
          {!isSignUp && (
            <button
              type="button"
              onClick={handleTestLogin}
              className="w-full py-2.5 px-3.5 bg-[#EBF3EF] dark:bg-[#172B25] hover:bg-[#DFECE4] dark:hover:bg-[#1E3831] border border-[#BEDBCF] dark:border-[#2A4B40] rounded-xl text-xs font-bold text-[#1A3636] dark:text-[#8EB79F] transition-all flex items-center justify-between shadow-2xs group cursor-pointer"
            >
              <div className="flex items-center space-x-2">
                <ShieldCheck className="w-4 h-4 text-[#356149] dark:text-[#7EA68E] shrink-0" />
                <span className="font-semibold">Yönetici / Test Girişi</span>
              </div>
              <span className="font-mono text-[11px] bg-[#FFFFFF] dark:bg-[#101E1A] px-2 py-0.5 rounded-md text-[#356149] dark:text-[#8EB79F] border border-[#BEDBCF]/60 dark:border-[#2A4B40]/60">
                test / test
              </span>
            </button>
          )}

          <form onSubmit={handleSubmit} className="space-y-3.5">
            {isSignUp && (
              <div>
                <label className="block text-xs font-semibold text-[#5A6B68] dark:text-[#8C9E99] mb-1">
                  Ad Soyad
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ahmet Yılmaz"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-[#FAF9F7] dark:bg-[#131C1A] border border-[#E8E3DD] dark:border-[#263834] focus:border-[#1A3636] dark:focus:border-[#7EA68E] rounded-xl text-sm text-[#1A3636] dark:text-[#F1EFEA] outline-hidden font-medium"
                />
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-[#5A6B68] dark:text-[#8C9E99] mb-1">
                E-posta veya Kullanıcı Adı
              </label>
              <input
                type="text"
                inputMode="email"
                autoCapitalize="none"
                required
                placeholder={isSignUp ? 'ornek@email.com' : "ornek@email.com veya 'test'"}
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-[#FAF9F7] dark:bg-[#131C1A] border border-[#E8E3DD] dark:border-[#263834] focus:border-[#1A3636] dark:focus:border-[#7EA68E] rounded-xl text-sm text-[#1A3636] dark:text-[#F1EFEA] outline-hidden font-medium"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#5A6B68] dark:text-[#8C9E99] mb-1">
                Şifre
              </label>
              <input
                type="password"
                required
                placeholder={isSignUp ? 'En az 6 karakter' : '••••••••'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-[#FAF9F7] dark:bg-[#131C1A] border border-[#E8E3DD] dark:border-[#263834] focus:border-[#1A3636] dark:focus:border-[#7EA68E] rounded-xl text-sm text-[#1A3636] dark:text-[#F1EFEA] outline-hidden font-medium"
              />
            </div>

            {errorMsg && (
              <div className="p-3 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/40 rounded-xl text-xs text-rose-700 dark:text-rose-400 flex items-center space-x-1.5">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            {successMsg && (
              <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900/40 rounded-xl text-xs text-emerald-700 dark:text-emerald-400 flex items-center space-x-1.5">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span>{successMsg}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-[#1A3636] dark:bg-[#7EA68E] hover:bg-[#122525] dark:hover:bg-[#6D947C] active:scale-[0.99] text-[#F9F8F6] dark:text-[#0F1715] font-bold text-sm rounded-xl shadow-md transition-all flex items-center justify-center space-x-2 disabled:opacity-50 cursor-pointer"
            >
              {isSignUp ? <UserPlus className="w-4 h-4" /> : <LogIn className="w-4 h-4" />}
              <span>{loading ? 'İşleniyor...' : isSignUp ? 'Hesap Oluştur' : 'Giriş Yap'}</span>
            </button>
          </form>

          {/* Quick Demo Test Access */}
          <div className="pt-2 border-t border-[#E8E3DD] dark:border-[#263834] text-center">
            <button
              type="button"
              onClick={handleQuickDemo}
              className="text-xs text-[#678E77] dark:text-[#7EA68E] hover:underline font-semibold flex items-center justify-center space-x-1 mx-auto cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Geliştirici Girişi (Sıfır Bakiye ile Başla)</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
