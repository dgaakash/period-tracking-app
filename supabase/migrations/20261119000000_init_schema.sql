-- Barbie-Themed Menstrual & Women's Wellness Mobile Application
-- PostgreSQL Schema & Row Level Security (RLS) Migration

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. PROFILES
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT NOT NULL,
    display_name TEXT DEFAULT 'Princess',
    avatar_url TEXT,
    role TEXT DEFAULT 'primary' CHECK (role IN ('primary', 'partner')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. USER PREFERENCES
CREATE TABLE IF NOT EXISTS public.user_preferences (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE UNIQUE,
    theme TEXT DEFAULT 'barbie_pink' CHECK (theme IN ('barbie_pink', 'rose_quartz', 'lavender_dreams', 'strawberry_milk', 'cherry_blossom', 'midnight_pink')),
    greeting_enabled BOOLEAN DEFAULT TRUE,
    quiet_hours_enabled BOOLEAN DEFAULT FALSE,
    quiet_hours_start TEXT DEFAULT '22:00',
    quiet_hours_end TEXT DEFAULT '08:00',
    notifications_enabled BOOLEAN DEFAULT TRUE,
    pin_code TEXT,
    biometric_enabled BOOLEAN DEFAULT FALSE,
    tracking_mode TEXT DEFAULT 'standard' CHECK (tracking_mode IN ('standard', 'ttc', 'pregnancy', 'perimenopause')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. MENSTRUAL CYCLES
CREATE TABLE IF NOT EXISTS public.menstrual_cycles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    start_date DATE NOT NULL,
    end_date DATE,
    cycle_length INTEGER,
    period_length INTEGER,
    is_irregular BOOLEAN DEFAULT FALSE,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. PERIOD DAYS
CREATE TABLE IF NOT EXISTS public.period_days (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    cycle_id UUID REFERENCES public.menstrual_cycles(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    flow TEXT NOT NULL CHECK (flow IN ('spotting', 'light', 'medium', 'heavy', 'super')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, date)
);

-- 5. DAILY LOGS
CREATE TABLE IF NOT EXISTS public.daily_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    water_intake_ml INTEGER DEFAULT 0,
    sleep_hours NUMERIC(4, 1),
    sleep_quality INTEGER CHECK (sleep_quality BETWEEN 1 AND 5),
    energy_level INTEGER CHECK (energy_level BETWEEN 1 AND 10),
    stress_level INTEGER CHECK (stress_level BETWEEN 1 AND 10),
    bbt_celsius NUMERIC(4, 2),
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, date)
);

-- 6. SYMPTOMS
CREATE TABLE IF NOT EXISTS public.symptoms (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    category TEXT NOT NULL CHECK (category IN ('physical', 'mood', 'discharge', 'cervical', 'other')),
    symptom_name TEXT NOT NULL,
    severity INTEGER DEFAULT 5 CHECK (severity BETWEEN 1 AND 10),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. CUSTOM SYMPTOMS
CREATE TABLE IF NOT EXISTS public.custom_symptoms (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    category TEXT DEFAULT 'physical',
    icon TEXT DEFAULT 'sparkles',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 8. MOOD ENTRIES
CREATE TABLE IF NOT EXISTS public.mood_entries (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    mood_type TEXT NOT NULL,
    intensity INTEGER DEFAULT 5 CHECK (intensity BETWEEN 1 AND 10),
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 9. JOURNAL ENTRIES
CREATE TABLE IF NOT EXISTS public.journal_entries (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    photo_urls TEXT[] DEFAULT '{}',
    mood TEXT,
    is_private BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 10. CYCLE PREDICTIONS
CREATE TABLE IF NOT EXISTS public.cycle_predictions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    predicted_start_date DATE NOT NULL,
    predicted_end_date DATE NOT NULL,
    predicted_ovulation_date DATE NOT NULL,
    fertile_window_start DATE NOT NULL,
    fertile_window_end DATE NOT NULL,
    confidence_score NUMERIC(5, 2) DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 11. MEDICATION LOGS
CREATE TABLE IF NOT EXISTS public.medication_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    medication_name TEXT NOT NULL,
    dosage TEXT,
    taken BOOLEAN DEFAULT TRUE,
    taken_at TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 12. REMINDERS
CREATE TABLE IF NOT EXISTS public.reminders (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    type TEXT NOT NULL CHECK (type IN ('period', 'ovulation', 'hydration', 'medication', 'sleep', 'custom')),
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    reminder_time TEXT NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    days_of_week INTEGER[] DEFAULT '{0,1,2,3,4,5,6}',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 13. PARTNER CONNECTIONS
CREATE TABLE IF NOT EXISTS public.partner_connections (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    partner_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    invite_code TEXT UNIQUE NOT NULL,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'active', 'revoked')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 14. PARTNER PERMISSIONS
CREATE TABLE IF NOT EXISTS public.partner_permissions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    connection_id UUID NOT NULL REFERENCES public.partner_connections(id) ON DELETE CASCADE UNIQUE,
    share_cycle_phase BOOLEAN DEFAULT TRUE,
    share_period_dates BOOLEAN DEFAULT TRUE,
    share_symptoms BOOLEAN DEFAULT FALSE,
    share_moods BOOLEAN DEFAULT TRUE,
    share_updates BOOLEAN DEFAULT TRUE,
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 15. SHARED UPDATES
CREATE TABLE IF NOT EXISTS public.shared_updates (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    partner_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    message TEXT NOT NULL,
    update_type TEXT DEFAULT 'status',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 16. LOVE MESSAGES
CREATE TABLE IF NOT EXISTS public.love_messages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    sender_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    receiver_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    scheduled_for TIMESTAMPTZ DEFAULT NOW(),
    delivered_at TIMESTAMPTZ,
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 17. CARE CHECKLISTS
CREATE TABLE IF NOT EXISTS public.care_checklists (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    items JSONB NOT NULL DEFAULT '[]'::jsonb,
    is_custom BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 18. MEMORIES
CREATE TABLE IF NOT EXISTS public.memories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    photo_url TEXT,
    event_date DATE NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 19. ACHIEVEMENTS
CREATE TABLE IF NOT EXISTS public.achievements (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    badge_key TEXT NOT NULL,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    unlocked_at TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, badge_key)
);

-- 20. WEARABLE CONNECTIONS
CREATE TABLE IF NOT EXISTS public.wearable_connections (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    provider TEXT NOT NULL CHECK (provider IN ('health_connect', 'apple_health', 'oura', 'fitbit', 'whoop', 'withings', 'ultrahuman', 'polar', 'huawei_health', 'luna')),
    is_connected BOOLEAN DEFAULT FALSE,
    last_sync TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, provider)
);

-- 21. EDUCATIONAL ARTICLES
CREATE TABLE IF NOT EXISTS public.educational_articles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    category TEXT NOT NULL,
    title TEXT NOT NULL,
    summary TEXT NOT NULL,
    content TEXT NOT NULL,
    medical_references TEXT[] DEFAULT '{}',
    last_reviewed DATE NOT NULL,
    read_time_minutes INTEGER DEFAULT 3,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ROW LEVEL SECURITY (RLS) POLICIES

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.menstrual_cycles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.period_days ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.daily_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.symptoms ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.custom_symptoms ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mood_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.journal_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cycle_predictions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.medication_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reminders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.partner_connections ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.partner_permissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.shared_updates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.love_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.care_checklists ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.memories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.wearable_connections ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.educational_articles ENABLE ROW LEVEL SECURITY;

-- 1. Profiles policy
CREATE POLICY "Users can manage own profile" ON public.profiles
    FOR ALL USING (auth.uid() = id);

-- 2. User preferences policy
CREATE POLICY "Users can manage own preferences" ON public.user_preferences
    FOR ALL USING (auth.uid() = user_id);

-- 3. Menstrual cycles policy
CREATE POLICY "Users can manage own cycles" ON public.menstrual_cycles
    FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Partners can view cycle if permitted" ON public.menstrual_cycles
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.partner_connections pc
            JOIN public.partner_permissions pp ON pp.connection_id = pc.id
            WHERE pc.user_id = menstrual_cycles.user_id
              AND pc.partner_id = auth.uid()
              AND pc.status = 'active'
              AND pp.share_period_dates = TRUE
        )
    );

-- 4. Period days policy
CREATE POLICY "Users can manage own period days" ON public.period_days
    FOR ALL USING (auth.uid() = user_id);

-- 5. Daily logs policy
CREATE POLICY "Users can manage own daily logs" ON public.daily_logs
    FOR ALL USING (auth.uid() = user_id);

-- 6. Symptoms policy
CREATE POLICY "Users can manage own symptoms" ON public.symptoms
    FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Partners can view symptoms if permitted" ON public.symptoms
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.partner_connections pc
            JOIN public.partner_permissions pp ON pp.connection_id = pc.id
            WHERE pc.user_id = symptoms.user_id
              AND pc.partner_id = auth.uid()
              AND pc.status = 'active'
              AND pp.share_symptoms = TRUE
        )
    );

-- 7. Mood entries policy
CREATE POLICY "Users can manage own mood entries" ON public.mood_entries
    FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Partners can view moods if permitted" ON public.mood_entries
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.partner_connections pc
            JOIN public.partner_permissions pp ON pp.connection_id = pc.id
            WHERE pc.user_id = mood_entries.user_id
              AND pc.partner_id = auth.uid()
              AND pc.status = 'active'
              AND pp.share_moods = TRUE
        )
    );

-- 8. Journal entries policy
CREATE POLICY "Users can manage own journal entries" ON public.journal_entries
    FOR ALL USING (auth.uid() = user_id);

-- 9. Cycle predictions policy
CREATE POLICY "Users can manage own predictions" ON public.cycle_predictions
    FOR ALL USING (auth.uid() = user_id);

-- 10. Partner connections policy
CREATE POLICY "Users can view connections they are part of" ON public.partner_connections
    FOR ALL USING (auth.uid() = user_id OR auth.uid() = partner_id);

-- 11. Partner permissions policy
CREATE POLICY "Users can manage permissions for their connections" ON public.partner_permissions
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.partner_connections pc
            WHERE pc.id = partner_permissions.connection_id
              AND pc.user_id = auth.uid()
        )
    );

CREATE POLICY "Partners can view permissions" ON public.partner_permissions
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.partner_connections pc
            WHERE pc.id = partner_permissions.connection_id
              AND pc.partner_id = auth.uid()
        )
    );

-- 12. Love messages policy
CREATE POLICY "Users can manage love messages sent or received" ON public.love_messages
    FOR ALL USING (auth.uid() = sender_id OR auth.uid() = receiver_id);

-- 13. Care checklists, memories, achievements, wearables
CREATE POLICY "Users can manage care checklists" ON public.care_checklists
    FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can manage memories" ON public.memories
    FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can manage achievements" ON public.achievements
    FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can manage wearable connections" ON public.wearable_connections
    FOR ALL USING (auth.uid() = user_id);

-- 14. Educational articles policy (Public read-only)
CREATE POLICY "Anyone can view educational articles" ON public.educational_articles
    FOR SELECT USING (TRUE);
