import { createClient } from './client'
import { Account, Profile, Transaction, InstallmentPlan, RecurringExpense, SocialFeedItem, FriendshipDetail, Friendship } from '@/types'

export const isSupabaseConfigured = (): boolean => {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  return Boolean(url && key && !url.includes('placeholder') && !key.includes('placeholder'))
}

export function generateRandomUserCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
  let result = 'WTR-'
  for (let i = 0; i < 4; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return result
}

// --------------------------------------------------------------------------
// Auth Services
// --------------------------------------------------------------------------

export async function supabaseSignIn(email: string, password: string) {
  const supabase = createClient()
  return await supabase.auth.signInWithPassword({ email, password })
}

export async function supabaseSignUp(email: string, password: string, fullName: string) {
  const supabase = createClient()
  return await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        full_name: fullName,
      },
    },
  })
}

export async function supabaseSignOut() {
  const supabase = createClient()
  return await supabase.auth.signOut()
}

export async function supabaseGetSession() {
  const supabase = createClient()
  return await supabase.auth.getSession()
}

export async function getOrCreateUserProfile(userId: string, email?: string, fullName?: string): Promise<Profile | null> {
  const supabase = createClient()
  
  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .maybeSingle()

  if (profile) return profile as Profile

  // Eğer profil trigger ile oluşmadıysa doğrudan oluşturalım
  const newCode = generateRandomUserCode()
  const { data: inserted, error: insertError } = await supabase
    .from('profiles')
    .insert({
      id: userId,
      user_code: newCode,
      full_name: fullName || email?.split('@')[0] || 'Kullanıcı',
      email: email || null,
    } as any)
    .select('*')
    .single()

  if (insertError) {
    console.error('Profil oluşturulamadı:', insertError)
    return null
  }

  return inserted as Profile
}

// --------------------------------------------------------------------------
// Data Fetching Services
// --------------------------------------------------------------------------

export async function fetchUserData(userId: string) {
  const supabase = createClient()

  const [accRes, txRes, instRes, recRes] = await Promise.all([
    supabase.from('accounts').select('*').eq('user_id', userId),
    supabase.from('transactions').select('*').eq('user_id', userId).order('transaction_date', { ascending: false }),
    supabase.from('installment_plans').select('*').eq('user_id', userId).order('due_date', { ascending: true }),
    supabase.from('recurring_expenses').select('*').eq('user_id', userId),
  ])

  return {
    accounts: (accRes.data as unknown as Account[]) || [],
    transactions: (txRes.data as unknown as Transaction[]) || [],
    installmentPlans: (instRes.data as unknown as InstallmentPlan[]) || [],
    recurringExpenses: (recRes.data as unknown as RecurringExpense[]) || [],
  }
}

// --------------------------------------------------------------------------
// Friendship & Social Feed Services
// --------------------------------------------------------------------------

export async function fetchFriendships(userId: string): Promise<FriendshipDetail[]> {
  const supabase = createClient()

  // Kullanıcının taraf olduğu tüm arkadaşlıklar
  const { data, error } = await supabase
    .from('friendships')
    .select('*')
    .or(`requester_id.eq.${userId},addressee_id.eq.${userId}`)

  if (error || !data) return []

  const friendships = data as unknown as Friendship[]
  const details: FriendshipDetail[] = []

  for (const f of friendships) {
    const isIncoming = f.addressee_id === userId
    const otherId = isIncoming ? f.requester_id : f.addressee_id

    const { data: friendProfile } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', otherId)
      .maybeSingle()

    if (friendProfile) {
      details.push({
        id: f.id,
        status: f.status,
        isIncoming,
        friendProfile: friendProfile as Profile,
        created_at: f.created_at,
      })
    }
  }

  return details
}

export async function sendFriendRequest(requesterId: string, userCode: string) {
  const supabase = createClient()
  const cleanCode = userCode.trim().toUpperCase()

  // 1. Hedef kullanıcıyı bul
  const { data: targetData, error: targetError } = await supabase
    .from('profiles')
    .select('*')
    .eq('user_code', cleanCode)
    .maybeSingle()

  if (targetError || !targetData) {
    return { success: false, message: 'Bu kullanıcı koduna ait bir profil bulunamadı.' }
  }

  const targetProfile = targetData as Profile

  if (targetProfile.id === requesterId) {
    return { success: false, message: 'Kendi kullanıcı kodunuza arkadaşlık isteği gönderemezsiniz.' }
  }

  // 2. Mevcut istek var mı kontrol et
  const { data: existingData } = await supabase
    .from('friendships')
    .select('*')
    .or(
      `and(requester_id.eq.${requesterId},addressee_id.eq.${targetProfile.id}),and(requester_id.eq.${targetProfile.id},addressee_id.eq.${requesterId})`
    )
    .maybeSingle()

  if (existingData) {
    const existing = existingData as Friendship
    if (existing.status === 'accepted') {
      return { success: false, message: 'Bu kullanıcıyla zaten arkadaşsınız.' }
    }
    return { success: false, message: 'Bu kullanıcıyla bekleyen bir arkadaşlık isteğiniz bulunuyor.' }
  }

  // 3. İstek oluştur
  const { error: insertError } = await supabase.from('friendships').insert({
    requester_id: requesterId,
    addressee_id: targetProfile.id,
    status: 'pending',
  } as any)

  if (insertError) {
    return { success: false, message: 'İstek gönderilirken bir hata oluştu: ' + insertError.message }
  }

  return { success: true, message: `${targetProfile.full_name || cleanCode} kullanıcısına arkadaşlık isteği gönderildi.` }
}

export async function respondFriendRequest(friendshipId: string, status: 'accepted' | 'rejected') {
  const supabase = createClient()
  return await (supabase.from('friendships') as any).update({ status }).eq('id', friendshipId)
}

export async function fetchSocialFeed(): Promise<SocialFeedItem[]> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('social_feed_view')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(50)

  if (error || !data) return []
  return data as unknown as SocialFeedItem[]
}
