# 🎀 Barbie-Themed Menstrual & Women's Wellness Mobile App

> A luxurious, romantic, and production-quality native Android application inspired by Clue, designed for every woman to track her menstrual rhythm and emotional wellness completely free — with zero paywalls, zero advertisements, and zero subscriptions forever.

---

## 🌸 Visual Identity & Aesthetic

The application is styled with a **Pink Barbie Dreamland** design language:
- **Primary Pink**: `#FF4FA3` (Barbie Pink)
- **Secondary Pink**: `#FF8FC7` (Rose Pink)
- **Soft Blush Background**: `#FFF0F6`
- **Surface**: `#FFFFFF` / Soft Translucent Glassmorphism
- **Accent**: `#C8A2FF` (Lavender)
- **Highlight**: `#FFD6E7` (Champagne Pink)
- **Text**: `#51243D` (Deep Plum)
- **Success**: `#A8E6CF` (Soft Mint)
- **6 Custom Theme Presets**: Barbie Pink (Classic), Rose Quartz, Lavender Dreams, Strawberry Milk, Cherry Blossom, and Midnight Pink (Night Mode).

Fluid micro-interactions, floating hearts, sparkles, and guided breathing animations are powered by **React Native Reanimated**.

---

## ✨ Key Features & Modules

### 1. 👑 Personalized Welcome Experience
- **First Launch**: Special celebratory animated greeting: *"Welcome Princess! 💗"*
- **Subsequent Launches**: Randomly selects from **30+ non-consecutive** romantic and cute greetings (e.g., *"Welcome back, Princess! 👑"*, *"Welcome back, Cutie Pie! 💗"*, *"Hey Beautiful! Missed you! 💕"*).
- Micro-haptic feedback, smooth fade transitions, and toggleable in user preferences.

### 2. 📅 Complete Menstrual Cycle Tracking & Predictive Engine
- **Period Logging**: Instant single-tap period start/end and bleeding flow logging (*Spotting, Light, Medium, Heavy, Super*).
- **Interactive Calendar**: Color-coded phase visualizer:
  - 🔴 **Menstrual Phase**: Barbie Pink (`#FF4FA3`)
  - 🍑 **Follicular Phase**: Peach (`#FFAE9E`)
  - 🟣 **Ovulation Phase**: Purple (`#9B51E0`)
  - 🪻 **Luteal Phase**: Lavender (`#C8A2FF`)
- **Predictive Science**: Weighted moving average for cycle lengths, dynamic ovulation estimation (luteal adjustment), 6-day fertile window, and 12-month forward projections with confidence scoring.
- **Cycle Irregularity Monitoring**: Automatic variance detection (flags standard deviation > 7 days).
- **PMS & Cramp Predictor**: Alerts you 2–4 days before period onset.

### 3. 📝 Comprehensive Daily Wellness & Symptom Logger
- **11 Moods**: *Happy, Sad, Irritated, Anxious, Emotional, Calm, Excited, Stressed, Sensitive, Energetic, Low mood*.
- **12 Physical Symptoms**: *Cramps, Headaches, Migraines, Back pain, Bloating, Breast tenderness, Acne, Nausea, Fatigue, Dizziness, Constipation, Diarrhea*.
- **Vital Metrics**: Water intake counter (ml), sleep duration (hours) & sleep quality (1–5), energy levels (1–10), stress levels (1–10), Basal Body Temperature (BBT in °C), and private notes.

### 4. 📊 Advanced Analytics & Reports
- Historical averages: Average cycle length, shortest/longest cycle, average bleeding duration.
- Visual SVG charts for recent cycle lengths, cramps severity trend (1–10), and mood distribution.
- **Export Capabilities**: Export complete health history as CSV (for gynecologist consultations) or full JSON backup.

### 5. ❤️ Five Mandatory Romance & Personalized Modules
1. **Boyfriend's Care Dashboard**: A dedicated partner screen displaying her current cycle day, phase, and actionable phase-specific advice on how to care for her (*"Heat pad ready", "Her favorite sweet snacks", "Gentle massage", "Cozy cuddles"*).
2. **Surprise Love Messages**: Send and schedule romantic surprise messages that appear in her inbox and notifications. Includes quick presets (*"I wish I could give you a hug right now ❤️"*).
3. **Period Comfort Checklist**: An interactive checklist (*Heating pad, chamomile tea, oversized Barbie hoodie, chocolate treat, warm water, breathing exercise*) with custom item support and completion progress.
4. **Daily Emotional Check-in**: *"How are you feeling today, Princess? 💗"* — quick mood, energy, stress, and private journal reflection with history.
5. **Our Little Memories Scrapbook**: A private photo diary for anniversaries, dates, and special moments with photo attachments, dates, captions, and search.

### 6. 🌿 Princess Care Mode
- Guided 4-4-4 relaxation breathing circle (*Inhale 4s, Hold 4s, Exhale 4s*) powered by Reanimated to calm pelvic tension and soothe anxiety.
- Daily uplifting affirmations and restorative self-care rituals.

### 7. 📚 17-Category Educational Library
- In-depth articles covering *Menstrual health, Menstrual phases, Cramps, PMS/PMDD, Ovulation, Fertility, Cervical mucus, BBT, Pregnancy, Postpartum, Perimenopause, PCOS, Endometriosis, Hormonal health, Nutrition, Exercise, Sleep, and Self-care*.
- Complete medical citations and last-reviewed verification dates.

### 8. ⌚ Wearable Integrations Architecture
- Pluggable architecture for *Android Health Connect, Apple HealthKit (iOS documented), Oura Ring, Fitbit, WHOOP, Withings, Ultrahuman, Polar, Huawei Health, and Luna*.

### 9. 🛡️ Offline-First & Privacy Fortress
- **Expo SQLite**: Works 100% offline out of the box with zero network requirement.
- **Supabase Cloud Sync**: Bidirectional sync engine (`sync_queue`) with PostgreSQL Row Level Security (RLS) when connected.
- **Biometric Protection**: Optional Face ID / Fingerprint / Passcode protection via `expo-local-authentication`.
- **Zero Ads & Zero Data Brokers**: Complete data deletion and local wipe option.

---

## 🚀 GitHub Actions Automated Android APK Pipeline

You do **not** need Android Studio or Gradle installed locally to build the app! Every push to `main` automatically builds an installable Android APK directly on GitHub Actions.

### Workflow Configuration: `.github/workflows/android-build.yml`
1. Checks out repository.
2. Sets up Node.js 20, Java 17, and Android SDK.
3. Validates TypeScript code (`npm run typecheck`).
4. Executes automated unit tests (`npm test`).
5. Runs Expo Prebuild (`npx expo prebuild --platform android --clean`).
6. Compiles the Android APK with Gradle (`./gradlew assembleDebug` or `assembleRelease`).
7. Verifies the generated `.apk` file.
8. Uploads the file as an artifact: **`Barbie-Period-Tracker-Android-APK`**.

### How to Download the APK from GitHub Actions:
1. Push your code to your GitHub repository:
   ```bash
   git push origin main
   ```
2. Open your repository on GitHub in your browser.
3. Click on the **Actions** tab at the top.
4. Click on the latest workflow run: **Build Android APK**.
5. Scroll down to the **Artifacts** section at the bottom of the summary page.
6. Click **`Barbie-Period-Tracker-Android-APK`** to download the ZIP file.
7. Unzip the file to get `Barbie-Period-Tracker.apk`.
8. Send or transfer the `.apk` file to your Android phone, tap install, and enjoy!

---

## 🛠️ Local Development & Running

### Prerequisites
- Node.js 20+
- npm or bun

### Commands
```bash
# 1. Install dependencies
npm install

# 2. Run unit tests
npm test

# 3. Type check TypeScript
npm run typecheck

# 4. Start Expo development server
npx expo start
```

Press `a` in the terminal to run on an Android emulator or scan the QR code using Expo Go.

---

## 🗄️ Supabase Backend Setup (Optional)

The application runs in **offline-first local mode** by default. To enable multi-device sync with Supabase:

1. Create a project on [Supabase](https://supabase.com).
2. Run the migration script in the Supabase SQL Editor:
   - Copy and paste contents of [`supabase/migrations/20261119000000_init_schema.sql`](./supabase/migrations/20261119000000_init_schema.sql).
3. Copy your project URL and anon public key into `.env`:
   ```env
   EXPO_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
   EXPO_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
   ```
4. Restart the app. It will automatically detect Supabase and begin syncing the offline queue!

---

## 💖 Built with Love
Built for Princess with love, gentle care, and romantic sweetness. Forever free.
