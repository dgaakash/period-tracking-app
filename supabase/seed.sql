-- Barbie Period Tracker: Seed Educational Content & Achievements

INSERT INTO public.educational_articles (id, category, title, summary, content, medical_references, last_reviewed, read_time_minutes)
VALUES
(
    'a0000001-0000-0000-0000-000000000001',
    'Menstrual Health',
    'The Menstrual Cycle: A Full Biological Overview',
    'Discover how the hypothalamic-pituitary-ovarian axis orchestrates estrogen and progesterone each month.',
    'The menstrual cycle is far more than just your period. Controlled by a complex hormonal feedback loop connecting your brain (hypothalamus and pituitary gland) to your ovaries, it prepares the body for potential pregnancy each month while influencing energy, mood, metabolism, and immune function. A healthy cycle typically lasts between 21 and 35 days, with menstruation lasting 3 to 7 days.',
    ARRAY['American College of Obstetricians and Gynecologists (ACOG) Practice Bulletin No. 128', 'Endocrine Society Clinical Practice Guidelines (2022)'],
    '2026-01-15',
    4
),
(
    'a0000001-0000-0000-0000-000000000002',
    'Menstrual Phases',
    'The 4 Phases: Menstrual, Follicular, Ovulatory, and Luteal',
    'Learn how each phase uniquely affects your vitality, skin, and emotional state.',
    'Phase 1 (Menstrual): Days 1-5. Low estrogen and progesterone trigger uterine shedding. Rest and iron-rich foods are key.\n\nPhase 2 (Follicular): Days 6-13. Follicle-Stimulating Hormone (FSH) rises, boosting estrogen. Energy, confidence, and verbal fluency peak.\n\nPhase 3 (Ovulatory): Days 14-16. Luteinizing Hormone (LH) surges, releasing a mature egg. Heightened libido and social drive.\n\nPhase 4 (Luteal): Days 17-28. Progesterone takes center stage, preparing the endometrium. Metabolic rate slightly rises, demanding nourishing complex carbohydrates and grounding self-care.',
    ARRAY['Hormones and Behavior Journal: Cycle Variations (2021)', 'Cleveland Clinic Reproductive Endocrinology Review (2024)'],
    '2026-02-10',
    5
),
(
    'a0000001-0000-0000-0000-000000000003',
    'Period Cramps',
    'Understanding Dysmenorrhea & Effective Natural Relief',
    'Why prostaglandins cause cramping and evidence-backed ways to soothe pelvic discomfort.',
    'Primary dysmenorrhea is primarily driven by prostaglandins—lipid compounds that induce uterine contractions to shed the endometrium. Higher levels cause stronger contractions and temporary localized hypoxia, creating cramp sensations. Applying continuous low-level heat (heating pads at 40°C) has been proven in clinical trials to be as effective as ibuprofen by increasing local blood flow. Magnesium glycinate, omega-3 fatty acids, and gentle stretching further downregulate inflammatory prostaglandins.',
    ARRAY['Journal of Pediatric & Adolescent Gynecology (2020)', 'Cochrane Systematic Review: Dietary and Non-pharmacological Interventions for Dysmenorrhea (2023)'],
    '2026-01-20',
    4
),
(
    'a0000001-0000-0000-0000-000000000004',
    'PMS & PMDD',
    'Deciphering Premenstrual Syndrome vs. PMDD',
    'Navigating emotional sensitivity, irritability, and when to seek medical evaluation.',
    'Premenstrual Syndrome (PMS) affects up to 75% of menstruating individuals with mild to moderate symptoms such as bloating, breast tenderness, and mood changes in the late luteal phase. Premenstrual Dysphoric Disorder (PMDD), affecting 3-8%, is a severe neuroendocrine response to normal hormonal fluctuations, mediated by GABA-A receptor sensitivity to allopregnanolone. PMDD causes intense depressive feelings, anxiety, or rage that resolve within a few days of menses onset.',
    ARRAY['DSM-5 Diagnostic Criteria for PMDD', 'Lancet Psychiatry: Neurobiology of Premenstrual Dysphoric Disorder (2023)'],
    '2026-03-01',
    6
),
(
    'a0000001-0000-0000-0000-000000000005',
    'Ovulation',
    'Ovulation Signals: How Your Body Tells You an Egg is Released',
    'Recognizing mittelschmerz, LH surge detection, and peak cervical indicators.',
    'Ovulation occurs when a mature ovarian follicle ruptures and releases an oocyte into the fallopian tube. Common physiologic signs include clear, slippery cervical mucus resembling raw egg whites, a subtle surge in basal body temperature (0.3°C to 0.5°C) within 24 hours post-ovulation, unilateral lower pelvic twinges (mittelschmerz), and heightened sensory perception. Tracking multiple biomarkers yields the highest predictive reliability.',
    ARRAY['Human Reproduction Update (2022)', 'ACOG Committee Opinion on Fertility Awareness Methods (2021)'],
    '2026-02-18',
    4
),
(
    'a0000001-0000-0000-0000-000000000006',
    'Fertility',
    'The Fertile Window: Science-Based Conception Dynamics',
    'Understanding sperm viability, oocyte lifespan, and the 6-day fertile window.',
    'Sperm can survive in fertile cervical mucus for up to 5 days, while an unfertilized ovum remains viable for approximately 12 to 24 hours post-ovulation. Thus, the biological fertile window spans the 5 days preceding ovulation plus the day of ovulation itself. Peak conception probability occurs during the two days immediately before ovulation.',
    ARRAY['New England Journal of Medicine: Timing of Sexual Intercourse in Relation to Ovulation (Wilcox et al.)', 'BMJ Fertility Guidelines (2023)'],
    '2026-02-25',
    4
),
(
    'a0000001-0000-0000-0000-000000000007',
    'Cervical Mucus',
    'Decoding Cervical Fluid Throughout Your Cycle',
    'From dry to creamy to egg-white: interpreting biological hydration patterns.',
    'Cervical mucus changes in response to fluctuating estradiol. Post-menses, mucus is minimal or sticky/tacky. As follicular growth accelerates estrogen production, mucus transitions to creamy/lotion-like, and finally to clear, stretchy, and slippery (resembling raw egg white) right before ovulation. This egg-white fluid has an alkaline pH and parallel micellar channels designed to nourish and guide sperm through the cervix.',
    ARRAY['Billings Ovulation Method Clinical Studies', 'American Journal of Obstetrics & Gynecology (2022)'],
    '2026-01-30',
    3
),
(
    'a0000001-0000-0000-0000-000000000008',
    'BBT',
    'Basal Body Temperature Tracking: Tips for Accurate Thermal Charting',
    'How progesterone raises your resting core temperature and how to read the biphasic shift.',
    'Basal Body Temperature (BBT) is your lowest body temperature during rest. Prior to ovulation, BBT usually hovers between 36.1°C and 36.4°C (97.0°F - 97.6°F). Following ovulation, the corpus luteum produces progesterone, which acts on the thermoregulatory center in the hypothalamus to elevate BBT by 0.2°C to 0.5°C through the remainder of the luteal phase. For accurate logging, measure temperature immediately upon waking after at least 3-4 hours of uninterrupted sleep.',
    ARRAY['Fertility and Sterility Journal: Biomarkers of Ovulation (2021)', 'International Journal of Gynecology & Obstetrics (2023)'],
    '2026-02-12',
    4
),
(
    'a0000001-0000-0000-0000-000000000009',
    'PCOS Education',
    'Navigating Polycystic Ovary Syndrome (PCOS)',
    'Rotterdam diagnostic criteria, insulin sensitivity, and cycle regulation tips.',
    'Polycystic Ovary Syndrome (PCOS) is an endocrine disorder characterized by hyperandrogenism, ovulatory dysfunction (oligomenorrhea or amenorrhea), and polycystic ovarian morphology on ultrasound (meeting at least 2 of 3 Rotterdam criteria). Insulin resistance is present in over 70% of individuals with PCOS regardless of BMI. Nutrition focusing on low glycemic index foods, myo-inositol supplementation, and resistance training assists insulin sensitivity and supports consistent ovulation.',
    ARRAY['International Evidence-based Guideline for the Assessment and Management of PCOS (Monash University / ESHRE / ASRM 2023)', 'Journal of Clinical Endocrinology & Metabolism (2024)'],
    '2026-03-05',
    6
),
(
    'a0000001-0000-0000-0000-000000000010',
    'Endometriosis Education',
    'Endometriosis: Symptoms, Diagnosis & Compassionate Care',
    'Recognizing deep pelvic pain, inflammation management, and advocacy in clinical care.',
    'Endometriosis is a systemic inflammatory condition wherein tissue similar to the endometrium grows outside the uterine cavity (e.g., ovaries, peritoneum, bowel). Classic symptoms include severe dysmenorrhea, deep dyspareunia, chronic pelvic pain, and fatigue. Because symptoms often overlap with gastrointestinal conditions, average diagnostic delay spans 7 to 10 years. Anti-inflammatory lifestyle measures, pelvic floor physical therapy, and personalized medical management under a specialist provide substantial symptom relief.',
    ARRAY['World Health Organization (WHO) Endometriosis Fact Sheet (2023)', 'European Society of Human Reproduction and Embryology (ESHRE) Endometriosis Guidelines (2022)'],
    '2026-02-28',
    5
),
(
    'a0000001-0000-0000-0000-000000000011',
    'Hormonal Health',
    'Hormone Balance 101: Estrogen, Progesterone & Cortisol',
    'How chronic stress impacts the HPA axis and ovarian hormone production.',
    'When the body is under sustained physiological or emotional stress, the hypothalamic-pituitary-adrenal (HPA) axis elevates cortisol production. High cortisol can suppress gonadotropin-releasing hormone (GnRH), impairing FSH and LH release, which may delay or prevent ovulation and cause missed or irregular periods. Prioritizing nervous system regulation, adequate caloric intake, and deep sleep preserves healthy neuroendocrine signaling.',
    ARRAY['Frontiers in Neuroendocrinology: Stress and the Female Reproductive Axis (2022)', 'Endocrine Reviews: Adrenal and Gonadal Crosstalk (2021)'],
    '2026-01-22',
    5
),
(
    'a0000001-0000-0000-0000-000000000012',
    'Period Nutrition',
    'Cycle Syncing Nutrition: Fueling Every Phase',
    'Micronutrient needs: Iron, B vitamins, magnesium, and hydration throughout the month.',
    'During menses, replacing iron lost in menstrual blood with heme and non-heme iron paired with vitamin C is vital. In the follicular phase, fermented foods and leafy greens support healthy estrogen metabolism. In the luteal phase, baseline resting metabolic rate increases by approximately 100-300 kcal/day; incorporating complex carbohydrates (sweet potatoes, oats), magnesium, and vitamin B6 aids serotonin synthesis and curbs PMS cravings.',
    ARRAY['American Journal of Clinical Nutrition (2021)', 'Nutrients Journal: Nutrition and Menstrual Health Review (2023)'],
    '2026-02-05',
    4
),
(
    'a0000001-0000-0000-0000-000000000013',
    'Exercise',
    'Aligning Workouts With Your Energy Cycles',
    'Strength training in the follicular phase vs. restorative mobility in the luteal phase.',
    'In the follicular and ovulatory phases, elevated estrogen enhances muscle protein synthesis and glycogen sparing, making it optimal for high-intensity interval training (HIIT), progressive overload lifting, and speed training. In the mid-to-late luteal phase, higher core body temperature and increased progesterone promote protein catabolism; shifting focus toward steady-state cardio, yoga, Pilates, and walking optimizes recovery while minimizing cortisol elevation.',
    ARRAY['Sports Medicine Open: Menstrual Cycle Phases and Exercise Performance (2023)', 'British Journal of Sports Medicine (2022)'],
    '2026-02-14',
    4
),
(
    'a0000001-0000-0000-0000-000000000014',
    'Sleep',
    'Sleep Patterns & Body Temperature Shifts',
    'Why progesterone affects REM sleep and tips for restful nights before your period.',
    'Progesterone is naturally neurosteroidogenic and promotes sleepiness via GABA receptors, yet its thermogenic effect elevates core body temperature in the luteal phase, which can disrupt sleep architecture, fragment REM cycles, and cause vivid dreams or nighttime awakenings. Keeping the bedroom cooler (18-19°C / 65-67°F) and avoiding blue light prior to sleep facilitates core temperature reduction, supporting continuous deep slow-wave sleep.',
    ARRAY['Sleep Medicine Reviews: Sleep and the Menstrual Cycle (2022)', 'Journal of Sleep Research (2023)'],
    '2026-01-28',
    4
),
(
    'a0000001-0000-0000-0000-000000000015',
    'Perimenopause',
    'Perimenopause Demystified: The Menopausal Transition',
    'Understanding erratic cycles, vasomotor symptoms, and protecting bone density.',
    'Perimenopause is the transitional phase preceding menopause, typically beginning in the 40s and lasting 4 to 8 years. As ovarian follicle reserves diminish, estrogen levels fluctuate widely rather than steadily declining, leading to shortened or skipped cycles, night sweats, brain fog, and mood lability. Calcium, vitamin D3, weight-bearing exercise, and discussing hormone replacement therapy (HRT) options with a gynecologist safeguard cardiovascular and bone longevity.',
    ARRAY['North American Menopause Society (NAMS) Position Statement (2023)', 'JAMA Internal Medicine: Menopause Transition Guide (2022)'],
    '2026-03-08',
    5
),
(
    'a0000001-0000-0000-0000-000000000016',
    'Postpartum Recovery',
    'Postpartum Healing & The Return of Menstruation',
    'Lochia vs. true periods, prolactin suppression, and pelvic floor restoration.',
    'Lochia is normal postpartum uterine discharge that continues for 4 to 6 weeks as the placental site heals. In breastfeeding individuals, high prolactin levels inhibit GnRH, delaying ovulation (lactational amenorrhea); however, ovulation can precede the very first postpartum period, meaning fertility can return before bleeding resumes. Rest, gentle pelvic floor rehabilitation, and nourishing meals support recovery during the fourth trimester.',
    ARRAY['ACOG Clinical Guidelines: Optimizing Postpartum Care (2021)', 'Cochrane Reviews: Postpartum Interventions (2022)'],
    '2026-02-02',
    5
),
(
    'a0000001-0000-0000-0000-000000000017',
    'Self-Care',
    'The Princess Care Philosophy: Compassionate Self-Care',
    'Embracing bodily autonomy, gentle mindfulness, and honoring your monthly rhythms.',
    'The Princess Care philosophy is grounded in honoring the body without guilt or shame. Recognizing that female biology is infradian (operating on a ~28-day cycle rather than just a 24-hour circadian clock) allows you to celebrate peak social days and grant yourself permission to rest on quieter days. Self-care is not indulgence; it is a foundational biological necessity.',
    ARRAY['Harvard Health Publishing: Mind-Body Medicine (2023)', 'Journal of Women''s Health: Holistic Wellness Practices (2024)'],
    '2026-01-10',
    3
);
