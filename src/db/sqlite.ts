import * as SQLite from 'expo-sqlite';

let dbInstance: SQLite.SQLiteDatabase | null = null;

export async function getDatabase(): Promise<SQLite.SQLiteDatabase> {
  if (!dbInstance) {
    dbInstance = await SQLite.openDatabaseAsync('barbie_tracker.db');
    await initDatabase(dbInstance);
  }
  return dbInstance;
}

export function getDatabaseSync(): SQLite.SQLiteDatabase {
  if (!dbInstance) {
    dbInstance = SQLite.openDatabaseSync('barbie_tracker.db');
  }
  return dbInstance;
}

export async function initDatabase(db: SQLite.SQLiteDatabase): Promise<void> {
  await db.execAsync(`
    PRAGMA journal_mode = WAL;
    PRAGMA foreign_keys = ON;

    CREATE TABLE IF NOT EXISTS profiles (
      id TEXT PRIMARY KEY,
      email TEXT NOT NULL,
      display_name TEXT DEFAULT 'Princess',
      avatar_url TEXT,
      role TEXT DEFAULT 'primary',
      created_at TEXT DEFAULT (datetime('now')),
      updated_at TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS user_preferences (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      theme TEXT DEFAULT 'barbie_pink',
      greeting_enabled INTEGER DEFAULT 1,
      quiet_hours_enabled INTEGER DEFAULT 0,
      quiet_hours_start TEXT DEFAULT '22:00',
      quiet_hours_end TEXT DEFAULT '08:00',
      notifications_enabled INTEGER DEFAULT 1,
      pin_code TEXT,
      biometric_enabled INTEGER DEFAULT 0,
      tracking_mode TEXT DEFAULT 'standard',
      has_seen_first_welcome INTEGER DEFAULT 0,
      created_at TEXT DEFAULT (datetime('now')),
      updated_at TEXT DEFAULT (datetime('now')),
      FOREIGN KEY (user_id) REFERENCES profiles (id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS menstrual_cycles (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      start_date TEXT NOT NULL,
      end_date TEXT,
      cycle_length INTEGER,
      period_length INTEGER,
      is_irregular INTEGER DEFAULT 0,
      notes TEXT,
      created_at TEXT DEFAULT (datetime('now')),
      updated_at TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS period_days (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      cycle_id TEXT,
      date TEXT NOT NULL,
      flow TEXT NOT NULL,
      created_at TEXT DEFAULT (datetime('now')),
      UNIQUE(user_id, date)
    );

    CREATE TABLE IF NOT EXISTS daily_logs (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      date TEXT NOT NULL,
      water_intake_ml INTEGER DEFAULT 0,
      sleep_hours REAL,
      sleep_quality INTEGER,
      energy_level INTEGER,
      stress_level INTEGER,
      bbt_celsius REAL,
      notes TEXT,
      created_at TEXT DEFAULT (datetime('now')),
      updated_at TEXT DEFAULT (datetime('now')),
      UNIQUE(user_id, date)
    );

    CREATE TABLE IF NOT EXISTS symptoms (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      date TEXT NOT NULL,
      category TEXT NOT NULL,
      symptom_name TEXT NOT NULL,
      severity INTEGER DEFAULT 5,
      created_at TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS custom_symptoms (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      name TEXT NOT NULL,
      category TEXT DEFAULT 'physical',
      icon TEXT DEFAULT 'sparkles',
      created_at TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS mood_entries (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      date TEXT NOT NULL,
      mood_type TEXT NOT NULL,
      intensity INTEGER DEFAULT 5,
      notes TEXT,
      created_at TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS journal_entries (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      date TEXT NOT NULL,
      title TEXT NOT NULL,
      content TEXT NOT NULL,
      photo_urls TEXT DEFAULT '[]',
      mood TEXT,
      is_private INTEGER DEFAULT 1,
      created_at TEXT DEFAULT (datetime('now')),
      updated_at TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS cycle_predictions (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      predicted_start_date TEXT NOT NULL,
      predicted_end_date TEXT NOT NULL,
      predicted_ovulation_date TEXT NOT NULL,
      fertile_window_start TEXT NOT NULL,
      fertile_window_end TEXT NOT NULL,
      confidence_score REAL DEFAULT 0,
      created_at TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS medication_logs (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      date TEXT NOT NULL,
      medication_name TEXT NOT NULL,
      dosage TEXT,
      taken INTEGER DEFAULT 1,
      taken_at TEXT DEFAULT (datetime('now')),
      created_at TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS reminders (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      type TEXT NOT NULL,
      title TEXT NOT NULL,
      message TEXT NOT NULL,
      reminder_time TEXT NOT NULL,
      is_active INTEGER DEFAULT 1,
      days_of_week TEXT DEFAULT '[0,1,2,3,4,5,6]',
      created_at TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS love_messages (
      id TEXT PRIMARY KEY,
      sender_id TEXT NOT NULL,
      receiver_id TEXT NOT NULL,
      content TEXT NOT NULL,
      scheduled_for TEXT,
      delivered_at TEXT,
      is_read INTEGER DEFAULT 0,
      created_at TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS care_checklists (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      title TEXT NOT NULL,
      items TEXT NOT NULL DEFAULT '[]',
      is_custom INTEGER DEFAULT 0,
      created_at TEXT DEFAULT (datetime('now')),
      updated_at TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS memories (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      title TEXT NOT NULL,
      description TEXT,
      photo_url TEXT,
      event_date TEXT NOT NULL,
      created_at TEXT DEFAULT (datetime('now')),
      updated_at TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS achievements (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      badge_key TEXT NOT NULL,
      title TEXT NOT NULL,
      description TEXT NOT NULL,
      unlocked_at TEXT DEFAULT (datetime('now')),
      created_at TEXT DEFAULT (datetime('now')),
      UNIQUE(user_id, badge_key)
    );

    CREATE TABLE IF NOT EXISTS sync_queue (
      id TEXT PRIMARY KEY,
      table_name TEXT NOT NULL,
      record_id TEXT NOT NULL,
      operation TEXT NOT NULL,
      payload TEXT NOT NULL,
      status TEXT DEFAULT 'pending',
      retry_count INTEGER DEFAULT 0,
      error_message TEXT,
      created_at TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS educational_articles (
      id TEXT PRIMARY KEY,
      category TEXT NOT NULL,
      title TEXT NOT NULL,
      summary TEXT NOT NULL,
      content TEXT NOT NULL,
      medical_references TEXT DEFAULT '[]',
      last_reviewed TEXT NOT NULL,
      read_time_minutes INTEGER DEFAULT 3,
      created_at TEXT DEFAULT (datetime('now'))
    );
  `);

  await seedLocalDefaults(db);
}

// Seed local default profile, checklist, and educational articles if not present
async function seedLocalDefaults(db: SQLite.SQLiteDatabase): Promise<void> {
  const profile = await db.getFirstAsync<{ id: string }>('SELECT id FROM profiles LIMIT 1');
  const defaultUserId = 'local-princess-user';

  if (!profile) {
    await db.runAsync(
      `INSERT INTO profiles (id, email, display_name, role) VALUES (?, ?, ?, ?)`,
      [defaultUserId, 'princess@barbieworld.app', 'Princess', 'primary']
    );

    await db.runAsync(
      `INSERT INTO user_preferences (id, user_id, theme, greeting_enabled, has_seen_first_welcome)
       VALUES (?, ?, 'barbie_pink', 1, 0)`,
      ['pref-local-1', defaultUserId]
    );

    // Seed default comfort checklist items
    const defaultChecklistItems = JSON.stringify([
      { id: '1', label: 'Warm heating pad on tummy', completed: false },
      { id: '2', label: 'Chamomile or raspberry leaf tea', completed: false },
      { id: '3', label: 'Super comfy oversized Barbie hoodie', completed: false },
      { id: '4', label: 'Sweet chocolate / comfort treat', completed: false },
      { id: '5', label: 'Drink a big glass of warm water', completed: false },
      { id: '6', label: 'Gentle 5-minute breathing exercise', completed: false },
      { id: '7', label: 'Cuddle with plushie / sweet nap', completed: false }
    ]);

    await db.runAsync(
      `INSERT INTO care_checklists (id, user_id, title, items, is_custom)
       VALUES (?, ?, ?, ?, 0)`,
      ['chk-default', defaultUserId, 'Princess Period Comfort Kit', defaultChecklistItems]
    );

    // Seed romantic default love notes
    const defaultMessages = [
      "I wish I could give you a warm hug right now ❤️",
      "You are my favourite person in the entire world. Take it easy today, Princess! 🌸",
      "Sending you all my love and extra cuddles today! 🧸",
      "Remember you're doing amazing, and I'm always right here cheering for you! 💕"
    ];

    for (let i = 0; i < defaultMessages.length; i++) {
      await db.runAsync(
        `INSERT INTO love_messages (id, sender_id, receiver_id, content, is_read)
         VALUES (?, ?, ?, ?, 0)`,
        [`love-seed-${i}`, 'boyfriend-user', defaultUserId, defaultMessages[i]]
      );
    }
  }

  // Seed default educational articles if empty
  const articlesCount = await db.getFirstAsync<{ count: number }>('SELECT count(*) as count FROM educational_articles');
  if (!articlesCount || articlesCount.count === 0) {
    const articles = [
      {
        id: 'edu-1',
        category: 'Menstrual Health',
        title: 'The Menstrual Cycle: A Full Biological Overview',
        summary: 'Discover how the hypothalamic-pituitary-ovarian axis orchestrates estrogen and progesterone each month.',
        content: 'The menstrual cycle is far more than just your period. Controlled by a complex hormonal feedback loop connecting your brain (hypothalamus and pituitary gland) to your ovaries, it prepares the body for potential pregnancy each month while influencing energy, mood, metabolism, and immune function. A healthy cycle typically lasts between 21 and 35 days, with menstruation lasting 3 to 7 days.',
        references: JSON.stringify(['ACOG Practice Bulletin No. 128', 'Endocrine Society Clinical Practice Guidelines (2022)']),
        lastReviewed: '2026-01-15',
        readTime: 4
      },
      {
        id: 'edu-2',
        category: 'Menstrual Phases',
        title: 'The 4 Phases: Menstrual, Follicular, Ovulatory, and Luteal',
        summary: 'Learn how each phase uniquely affects your vitality, skin, and emotional state.',
        content: 'Phase 1 (Menstrual): Days 1-5. Low estrogen and progesterone trigger uterine shedding. Rest and iron-rich foods are key.\n\nPhase 2 (Follicular): Days 6-13. Follicle-Stimulating Hormone (FSH) rises, boosting estrogen. Energy, confidence, and verbal fluency peak.\n\nPhase 3 (Ovulatory): Days 14-16. Luteinizing Hormone (LH) surges, releasing a mature egg. Heightened libido and social drive.\n\nPhase 4 (Luteal): Days 17-28. Progesterone takes center stage, preparing the endometrium. Metabolic rate slightly rises, demanding nourishing complex carbohydrates and grounding self-care.',
        references: JSON.stringify(['Hormones and Behavior Journal (2021)', 'Cleveland Clinic Reproductive Endocrinology (2024)']),
        lastReviewed: '2026-02-10',
        readTime: 5
      },
      {
        id: 'edu-3',
        category: 'Period Cramps',
        title: 'Understanding Dysmenorrhea & Effective Natural Relief',
        summary: 'Why prostaglandins cause cramping and evidence-backed ways to soothe pelvic discomfort.',
        content: 'Primary dysmenorrhea is primarily driven by prostaglandins—lipid compounds that induce uterine contractions to shed the endometrium. Higher levels cause stronger contractions and temporary localized hypoxia, creating cramp sensations. Applying continuous low-level heat (heating pads at 40°C) has been proven in clinical trials to be as effective as ibuprofen by increasing local blood flow. Magnesium glycinate, omega-3 fatty acids, and gentle stretching further downregulate inflammatory prostaglandins.',
        references: JSON.stringify(['Journal of Pediatric & Adolescent Gynecology (2020)', 'Cochrane Systematic Review (2023)']),
        lastReviewed: '2026-01-20',
        readTime: 4
      },
      {
        id: 'edu-4',
        category: 'PMS & PMDD',
        title: 'Deciphering Premenstrual Syndrome vs. PMDD',
        summary: 'Navigating emotional sensitivity, irritability, and when to seek medical evaluation.',
        content: 'Premenstrual Syndrome (PMS) affects up to 75% of menstruating individuals with mild to moderate symptoms such as bloating, breast tenderness, and mood changes in the late luteal phase. Premenstrual Dysphoric Disorder (PMDD), affecting 3-8%, is a severe neuroendocrine response to normal hormonal fluctuations, mediated by GABA-A receptor sensitivity to allopregnanolone. PMDD causes intense depressive feelings, anxiety, or rage that resolve within a few days of menses onset.',
        references: JSON.stringify(['DSM-5 Diagnostic Criteria for PMDD', 'Lancet Psychiatry Review (2023)']),
        lastReviewed: '2026-03-01',
        readTime: 6
      },
      {
        id: 'edu-5',
        category: 'Ovulation',
        title: 'Ovulation Signals: How Your Body Tells You an Egg is Released',
        summary: 'Recognizing mittelschmerz, LH surge detection, and peak cervical indicators.',
        content: 'Ovulation occurs when a mature ovarian follicle ruptures and releases an oocyte into the fallopian tube. Common physiologic signs include clear, slippery cervical mucus resembling raw egg whites, a subtle surge in basal body temperature (0.3°C to 0.5°C) within 24 hours post-ovulation, unilateral lower pelvic twinges (mittelschmerz), and heightened sensory perception. Tracking multiple biomarkers yields the highest predictive reliability.',
        references: JSON.stringify(['Human Reproduction Update (2022)', 'ACOG Fertility Awareness Methods (2021)']),
        lastReviewed: '2026-02-18',
        readTime: 4
      },
      {
        id: 'edu-6',
        category: 'Fertility',
        title: 'The Fertile Window: Science-Based Conception Dynamics',
        summary: 'Understanding sperm viability, oocyte lifespan, and the 6-day fertile window.',
        content: 'Sperm can survive in fertile cervical mucus for up to 5 days, while an unfertilized ovum remains viable for approximately 12 to 24 hours post-ovulation. Thus, the biological fertile window spans the 5 days preceding ovulation plus the day of ovulation itself. Peak conception probability occurs during the two days immediately before ovulation.',
        references: JSON.stringify(['New England Journal of Medicine (Wilcox et al.)', 'BMJ Fertility Guidelines (2023)']),
        lastReviewed: '2026-02-25',
        readTime: 4
      },
      {
        id: 'edu-7',
        category: 'Period Nutrition',
        title: 'Cycle Syncing Nutrition: Fueling Every Phase',
        summary: 'Micronutrient needs: Iron, B vitamins, magnesium, and hydration throughout the month.',
        content: 'During menses, replacing iron lost in menstrual blood with heme and non-heme iron paired with vitamin C is vital. In the follicular phase, fermented foods and leafy greens support healthy estrogen metabolism. In the luteal phase, baseline resting metabolic rate increases by approximately 100-300 kcal/day; incorporating complex carbohydrates (sweet potatoes, oats), magnesium, and vitamin B6 aids serotonin synthesis and curbs PMS cravings.',
        references: JSON.stringify(['American Journal of Clinical Nutrition (2021)', 'Nutrients Journal Review (2023)']),
        lastReviewed: '2026-02-05',
        readTime: 4
      },
      {
        id: 'edu-8',
        category: 'Self-Care',
        title: 'The Princess Care Philosophy: Compassionate Self-Care',
        summary: 'Embracing bodily autonomy, gentle mindfulness, and honoring your monthly rhythms.',
        content: 'The Princess Care philosophy is grounded in honoring the body without guilt or shame. Recognizing that female biology is infradian (operating on a ~28-day cycle rather than just a 24-hour circadian clock) allows you to celebrate peak social days and grant yourself permission to rest on quieter days. Self-care is not indulgence; it is a foundational biological necessity.',
        references: JSON.stringify(['Harvard Health Publishing (2023)', 'Journal of Women Health (2024)']),
        lastReviewed: '2026-01-10',
        readTime: 3
      }
    ];

    for (const a of articles) {
      await db.runAsync(
        `INSERT INTO educational_articles (id, category, title, summary, content, medical_references, last_reviewed, read_time_minutes)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [a.id, a.category, a.title, a.summary, a.content, a.references, a.lastReviewed, a.readTime]
      );
    }
  }
}
