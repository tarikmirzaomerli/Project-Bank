-- ==============================================================================
-- Migration: 20261008000001_initial_schema.sql
-- Description: Kapsamlı Kişisel Muhasebe & Taksit Takip PWA Veritabanı Mimarisi
-- ==============================================================================

-- 0. Gerekli Uzantılar
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ==============================================================================
-- 1. PROFILES TABLOSU & KULLANICI KODU ÜRETECİ
-- ==============================================================================

-- Benzersiz 6 haneli kullanıcı kodu üreten fonksiyon (Örn: WTR-8492)
CREATE OR REPLACE FUNCTION generate_unique_user_code()
RETURNS TEXT AS $$
DECLARE
    new_code TEXT;
    code_exists BOOLEAN;
BEGIN
    LOOP
        -- WTR- ile başlayan 4 karakterli rastgele büyük harf/rakam
        new_code := 'WTR-' || UPPER(SUBSTRING(MD5(RANDOM()::TEXT) FROM 1 FOR 4));
        
        -- Benzersizlik kontrolü
        SELECT EXISTS(SELECT 1 FROM public.profiles WHERE user_code = new_code) INTO code_exists;
        IF NOT code_exists THEN
            RETURN new_code;
        END IF;
    END LOOP;
END;
$$ LANGUAGE plpgsql VOLATILE;

-- Profiles Tablosu
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    user_code TEXT UNIQUE NOT NULL DEFAULT generate_unique_user_code(),
    full_name TEXT,
    email TEXT,
    avatar_url TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE INDEX IF NOT EXISTS idx_profiles_user_code ON public.profiles(user_code);

-- Yeni kullanıcı kaydolduğunda otomatik profil oluşturan trigger
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, full_name, email, user_code)
    VALUES (
        NEW.id,
        COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)),
        NEW.email,
        generate_unique_user_code()
    )
    ON CONFLICT (id) DO UPDATE
    SET 
        full_name = EXCLUDED.full_name,
        email = EXCLUDED.email;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ==============================================================================
-- 2. FRIENDSHIPS (ARKADAŞLIKLAR) TABLOSU
-- ==============================================================================

CREATE TABLE IF NOT EXISTS public.friendships (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    requester_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    addressee_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    status TEXT NOT NULL CHECK (status IN ('pending', 'accepted', 'rejected')) DEFAULT 'pending',
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    CONSTRAINT friendships_cannot_be_self CHECK (requester_id <> addressee_id),
    CONSTRAINT friendships_unique_pair UNIQUE (requester_id, addressee_id)
);

CREATE INDEX IF NOT EXISTS idx_friendships_requester ON public.friendships(requester_id);
CREATE INDEX IF NOT EXISTS idx_friendships_addressee ON public.friendships(addressee_id);
CREATE INDEX IF NOT EXISTS idx_friendships_status ON public.friendships(status);

-- ==============================================================================
-- 3. ACCOUNTS (HESAPLAR / KARTLAR) TABLOSU
-- ==============================================================================

CREATE TABLE IF NOT EXISTS public.accounts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    type TEXT NOT NULL CHECK (type IN ('cash', 'bank', 'credit_card')),
    bank_name TEXT, -- Garanti, İş Bankası, Ziraat, Yapı Kredi, Akbank, QNB vb.
    balance NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
    credit_limit NUMERIC(12, 2) DEFAULT 0.00,
    cutoff_day INTEGER CHECK (cutoff_day BETWEEN 1 AND 31), -- Ekstre kesim günü
    due_day INTEGER CHECK (due_day BETWEEN 1 AND 31), -- Son ödeme günü
    color TEXT DEFAULT '#1A3636',
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE INDEX IF NOT EXISTS idx_accounts_user_id ON public.accounts(user_id);
CREATE INDEX IF NOT EXISTS idx_accounts_type ON public.accounts(type);

-- ==============================================================================
-- 4. TRANSACTIONS (HARCAMALAR / HAREKETLER) TABLOSU
-- ==============================================================================

CREATE TABLE IF NOT EXISTS public.transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    account_id UUID NOT NULL REFERENCES public.accounts(id) ON DELETE CASCADE,
    amount NUMERIC(12, 2) NOT NULL,
    description TEXT NOT NULL,
    category TEXT NOT NULL, -- Market, Yeme & İçme, Teknoloji, Faturalar vb.
    transaction_date DATE NOT NULL DEFAULT CURRENT_DATE,
    is_private BOOLEAN NOT NULL DEFAULT FALSE,
    installment_group_id UUID, -- Taksitli alışveriş ise grup ID'si
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE INDEX IF NOT EXISTS idx_transactions_user_id ON public.transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_transactions_account_id ON public.transactions(account_id);
CREATE INDEX IF NOT EXISTS idx_transactions_date ON public.transactions(transaction_date);
CREATE INDEX IF NOT EXISTS idx_transactions_social ON public.transactions(user_id, is_private, transaction_date DESC);

-- ==============================================================================
-- 5. INSTALLMENT_PLANS (TAKSİT DİLİMLERİ & TAKVİMİ) TABLOSU
-- ==============================================================================

CREATE TABLE IF NOT EXISTS public.installment_plans (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    account_id UUID NOT NULL REFERENCES public.accounts(id) ON DELETE CASCADE,
    transaction_id UUID REFERENCES public.transactions(id) ON DELETE SET NULL,
    installment_group_id UUID NOT NULL,
    total_amount NUMERIC(12, 2) NOT NULL,
    installment_count INTEGER NOT NULL CHECK (installment_count > 1),
    current_installment INTEGER NOT NULL CHECK (current_installment >= 1),
    installment_amount NUMERIC(12, 2) NOT NULL,
    due_month_year TEXT NOT NULL, -- 'YYYY-MM' formatında (örn: '2026-11')
    due_date DATE NOT NULL,
    status TEXT NOT NULL CHECK (status IN ('upcoming', 'paid')) DEFAULT 'upcoming',
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE INDEX IF NOT EXISTS idx_installment_user_month ON public.installment_plans(user_id, due_month_year);
CREATE INDEX IF NOT EXISTS idx_installment_group ON public.installment_plans(installment_group_id);

-- ==============================================================================
-- 6. RECURRING_EXPENSES (SABİT / TEKRARLAYAN GİDERLER) TABLOSU
-- ==============================================================================

CREATE TABLE IF NOT EXISTS public.recurring_expenses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    account_id UUID REFERENCES public.accounts(id) ON DELETE SET NULL,
    title TEXT NOT NULL, -- Kira, Netflix, Spotify, Aidat, vb.
    amount NUMERIC(12, 2) NOT NULL,
    category TEXT DEFAULT 'Sabit Gider',
    day_of_month INTEGER NOT NULL CHECK (day_of_month BETWEEN 1 AND 31),
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE INDEX IF NOT EXISTS idx_recurring_user_active ON public.recurring_expenses(user_id, is_active);

-- ==============================================================================
-- 7. GÜVENLİK & RLS (ROW LEVEL SECURITY) POLİTİKALARI
-- ==============================================================================

-- RLS Etkinleştirme
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.friendships ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.installment_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.recurring_expenses ENABLE ROW LEVEL SECURITY;

-- Helper Function: İki kullanıcının onaylı arkadaş olup olmadığını kontrol eder
CREATE OR REPLACE FUNCTION public.are_friends(user1_id UUID, user2_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM public.friendships
        WHERE status = 'accepted'
        AND (
            (requester_id = user1_id AND addressee_id = user2_id)
            OR
            (requester_id = user2_id AND addressee_id = user1_id)
        )
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

-- 7.1 PROFILES POLİTİKALARI
-- Kullanıcı kendi profilini veya user_code ile arama yapmak için genel profilleri okuyabilir
CREATE POLICY "Profiles can be viewed by authenticated users"
    ON public.profiles FOR SELECT
    TO authenticated
    USING (true);

-- Kullanıcı sadece kendi profilini güncelleyebilir
CREATE POLICY "Users can update own profile"
    ON public.profiles FOR UPDATE
    TO authenticated
    USING (auth.uid() = id);

-- 7.2 FRIENDSHIPS POLİTİKALARI
-- Kullanıcı dahil olduğu arkadaşlık kayıtlarını okuyabilir
CREATE POLICY "Users can view own friendships"
    ON public.friendships FOR SELECT
    TO authenticated
    USING (auth.uid() = requester_id OR auth.uid() = addressee_id);

-- Kullanıcı arkadaşlık isteği oluşturabilir (istek gönderen kendisi olmalıdır)
CREATE POLICY "Users can send friendship requests"
    ON public.friendships FOR INSERT
    TO authenticated
    WITH CHECK (auth.uid() = requester_id);

-- Kullanıcı kendisine gelen veya gönderdiği isteği güncelleyebilir (onaylama/reddetme)
CREATE POLICY "Users can update friendship status"
    ON public.friendships FOR UPDATE
    TO authenticated
    USING (auth.uid() = requester_id OR auth.uid() = addressee_id);

-- Arkadaşlığı sonlandırma
CREATE POLICY "Users can delete own friendships"
    ON public.friendships FOR DELETE
    TO authenticated
    USING (auth.uid() = requester_id OR auth.uid() = addressee_id);

-- 7.3 ACCOUNTS POLİTİKALARI
-- Kullanıcı YALNIZCA kendi hesaplarını görebilir ve yönetebilir. Arkadaşlara KESİNLİKLE kapalıdır.
CREATE POLICY "Users have full control on own accounts"
    ON public.accounts FOR ALL
    TO authenticated
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- 7.4 TRANSACTIONS POLİTİKALARI
-- Kullanıcı kendi harcamalarını tamamen yönetebilir
CREATE POLICY "Users can manage own transactions"
    ON public.transactions FOR ALL
    TO authenticated
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- Onaylı arkadaşlar YALNIZCA is_private = false olan harcamaları görebilir (Hesap bakiyesi/detayı hariç)
CREATE POLICY "Friends can view public transactions"
    ON public.transactions FOR SELECT
    TO authenticated
    USING (
        is_private = FALSE
        AND public.are_friends(auth.uid(), user_id)
    );

-- 7.5 INSTALLMENT_PLANS POLİTİKALARI
-- Yalnızca hesap sahibi taksit planlarını görebilir ve yönetebilir
CREATE POLICY "Users have full control on own installment plans"
    ON public.installment_plans FOR ALL
    TO authenticated
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- 7.6 RECURRING_EXPENSES POLİTİKALARI
-- Yalnızca hesap sahibi sabit giderleri görebilir ve yönetebilir
CREATE POLICY "Users have full control on own recurring expenses"
    ON public.recurring_expenses FOR ALL
    TO authenticated
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- ==============================================================================
-- 8. SOSYAL AKIŞ VIEW'I (GÜVENLİ PAYLAŞIM)
-- ==============================================================================
-- Arkadaşlar için hesap bakiyesi veya hesap adı sızdırmadan temiz akış görünümü
CREATE OR REPLACE VIEW public.social_feed_view AS
SELECT 
    t.id AS transaction_id,
    t.user_id,
    p.full_name AS user_name,
    p.user_code,
    p.avatar_url,
    t.amount,
    t.description,
    t.category,
    t.transaction_date,
    t.created_at
FROM public.transactions t
JOIN public.profiles p ON p.id = t.user_id
WHERE t.is_private = FALSE;
